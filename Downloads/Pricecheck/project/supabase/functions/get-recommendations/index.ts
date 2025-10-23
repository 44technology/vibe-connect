import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ProductPrice {
  product_name: string;
  store_name: string;
  avg_price: number;
  last_seen: string;
}

interface StoreRecommendation {
  store_name: string;
  total_savings: number;
  product_count: number;
  products: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: patterns } = await supabase
      .from('shopping_patterns')
      .select(`
        product_id,
        products (name)
      `)
      .eq('user_id', user.id)
      .order('frequency', { ascending: false })
      .limit(20);

    if (!patterns || patterns.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No shopping patterns found. Upload more receipts to get recommendations.',
          recommendations: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const productIds = patterns.map(p => p.product_id);

    const { data: priceData } = await supabase
      .from('price_history')
      .select(`
        product_id,
        price,
        store_id,
        products (name),
        stores (name)
      `)
      .in('product_id', productIds)
      .order('recorded_at', { ascending: false });

    const pricesByProduct = new Map<string, ProductPrice[]>();

    priceData?.forEach((item: any) => {
      const productName = item.products.name;
      if (!pricesByProduct.has(productName)) {
        pricesByProduct.set(productName, []);
      }
      pricesByProduct.get(productName)!.push({
        product_name: productName,
        store_name: item.stores.name,
        avg_price: item.price,
        last_seen: new Date().toISOString(),
      });
    });

    const storeScores = new Map<string, StoreRecommendation>();

    pricesByProduct.forEach((prices, productName) => {
      const sortedPrices = prices.sort((a, b) => a.avg_price - b.avg_price);
      if (sortedPrices.length > 0) {
        const bestPrice = sortedPrices[0];
        const storeName = bestPrice.store_name;

        if (!storeScores.has(storeName)) {
          storeScores.set(storeName, {
            store_name: storeName,
            total_savings: 0,
            product_count: 0,
            products: [],
          });
        }

        const store = storeScores.get(storeName)!;
        store.product_count++;
        store.products.push(productName);

        if (sortedPrices.length > 1) {
          const avgOtherPrices = sortedPrices.slice(1).reduce((sum, p) => sum + p.avg_price, 0) / (sortedPrices.length - 1);
          store.total_savings += avgOtherPrices - bestPrice.avg_price;
        }
      }
    });

    const recommendations = Array.from(storeScores.values())
      .sort((a, b) => b.total_savings - a.total_savings)
      .slice(0, 3);

    return new Response(
      JSON.stringify({
        message: 'Recommendations based on your shopping patterns',
        recommendations,
        analyzed_products: pricesByProduct.size,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});