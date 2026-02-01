import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DollarSign, Edit, Save, Package, FileText, Gift, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

type ProductType = 'digital_product' | 'course_material' | 'bonus_content';

type Product = {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  classId?: number;
  className?: string;
};

export default function MonetizationPricingPage() {
  const [products, setProducts] = useState<Product[]>([
    // Digital Products
    { 
      id: 'dp1', 
      name: 'Venue Menu Guide', 
      description: 'Complete menu and pricing guide', 
      type: 'digital_product',
      price: 35,
      classId: null,
      className: 'Standalone',
    },
    { 
      id: 'dp2', 
      name: 'Event Planning Template', 
      description: 'Professional event planning templates', 
      type: 'digital_product',
      price: 49,
      classId: null,
      className: 'Standalone',
    },
    // Course Materials
    { 
      id: 'cm1', 
      name: 'Venue Setup Guide', 
      description: 'PDF guide for venue setup', 
      type: 'course_material',
      price: 18,
      classId: null,
      className: 'Standalone',
    },
    // Bonus Content
    { 
      id: 'bc1', 
      name: 'VIP Access Pass', 
      description: 'Exclusive VIP access content', 
      type: 'bonus_content',
      price: 29,
      classId: null,
      className: 'Standalone',
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const handleEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleSave = (id: string) => {
    if (!editPrice || parseFloat(editPrice) < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setProducts(products.map(p => 
      p.id === id ? { ...p, price: parseFloat(editPrice) } : p
    ));
    setEditingId(null);
    setEditPrice('');
    toast.success('Price updated successfully!');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const digitalProducts = products.filter(p => p.type === 'digital_product');
  const courseMaterials = products.filter(p => p.type === 'course_material');
  const bonusContent = products.filter(p => p.type === 'bonus_content');

  const getTypeIcon = (type: ProductType) => {
    switch (type) {
      case 'digital_product': return Package;
      case 'course_material': return FileText;
      case 'bonus_content': return Gift;
    }
  };

  const getTypeLabel = (type: ProductType) => {
    switch (type) {
      case 'digital_product': return 'Digital Product';
      case 'course_material': return 'Course Material';
      case 'bonus_content': return 'Bonus Content';
    }
  };

  const renderProductList = (productList: Product[]) => {
    if (productList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No products found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {productList.map((product) => {
          const Icon = getTypeIcon(product.type);
          return (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{product.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(product.type)}
                      </Badge>
                      {product.className && (
                        <Badge variant="secondary" className="text-xs">
                          {product.className}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editingId === product.id ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSave(product.id)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <span className="text-2xl font-bold">${product.price}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product.id, product.price)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Product Pricing</h1>
        <p className="text-muted-foreground mt-2">Manage pricing for your digital products, course materials, and bonus content</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="digital">Digital Products</TabsTrigger>
          <TabsTrigger value="materials">Course Materials</TabsTrigger>
          <TabsTrigger value="bonus">Bonus Content</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                All Products
              </CardTitle>
              <CardDescription>View and edit prices for all your products</CardDescription>
            </CardHeader>
            <CardContent>
              {renderProductList(products)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Digital Products
              </CardTitle>
              <CardDescription>Sellable digital products</CardDescription>
            </CardHeader>
            <CardContent>
              {renderProductList(digitalProducts)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Course Materials
              </CardTitle>
              <CardDescription>Materials available for purchase</CardDescription>
            </CardHeader>
            <CardContent>
              {renderProductList(courseMaterials)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Bonus Content
              </CardTitle>
              <CardDescription>Additional bonus content for sale</CardDescription>
            </CardHeader>
            <CardContent>
              {renderProductList(bonusContent)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Note</p>
              <p className="text-sm text-muted-foreground">
                Product prices can be edited here. Changes will affect all future purchases. 
                Existing purchases will not be affected by price changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
