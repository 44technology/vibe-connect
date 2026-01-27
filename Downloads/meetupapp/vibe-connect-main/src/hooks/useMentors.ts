import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { Mentor } from '@/components/cards/MentorCard';

export const useMentors = (search?: string, category?: string, expertise?: string) => {
  return useQuery({
    queryKey: ['mentors', search, category, expertise],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (expertise) params.append('expertise', expertise);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const url = `${API_ENDPOINTS.MENTORS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiRequest<{ success: boolean; data: Mentor[] }>(url);
        return response.data;
      } catch (error) {
        // Return mock data if API fails
        return getMockMentors();
      }
    },
  });
};

export const useMentor = (id: string) => {
  return useQuery({
    queryKey: ['mentor', id],
    queryFn: async () => {
      try {
        const response = await apiRequest<{ success: boolean; data: Mentor }>(
          API_ENDPOINTS.MENTORS.DETAIL(id)
        );
        return response.data;
      } catch (error) {
        // Return mock data if API fails
        return getMockMentors().find(m => m.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

// Mock mentors data
const getMockMentors = (): Mentor[] => [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    displayName: 'Ahmet Yılmaz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: '15 years of experience in the technology sector. I mentor in software development and startup creation.',
    title: 'CTO & Founder',
    company: 'TechStart Inc.',
    location: 'Istanbul, Turkey',
    rating: 4.9,
    reviewCount: 127,
    studentsCount: 342,
    expertise: ['Software Development', 'Startup', 'Artificial Intelligence', 'Blockchain'],
    achievements: ['Forbes 30 Under 30', 'TechCrunch Startup Award'],
    isVerified: true,
    yearsOfExperience: 15,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    displayName: 'Zeynep Kaya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: '12 years of experience in digital marketing and brand management. I have worked at Fortune 500 companies.',
    title: 'Marketing Director',
    company: 'Global Brands',
    location: 'Ankara, Turkey',
    rating: 4.8,
    reviewCount: 89,
    studentsCount: 256,
    expertise: ['Digital Marketing', 'Brand Management', 'Social Media', 'SEO'],
    achievements: ['Cannes Lions Award', 'Marketing Excellence Award'],
    isVerified: true,
    yearsOfExperience: 12,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    id: '3',
    name: 'Mehmet Demir',
    displayName: 'Mehmet Demir',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Expert in finance and investment consulting. I have been providing consulting services to individual and corporate clients for 20 years.',
    title: 'Senior Financial Advisor',
    company: 'Wealth Management Group',
    location: 'Izmir, Turkey',
    rating: 4.7,
    reviewCount: 203,
    studentsCount: 189,
    expertise: ['Finance', 'Investment', 'Stock Market', 'Retirement Planning'],
    achievements: ['CFA Charterholder', 'Top Financial Advisor 2023'],
    isVerified: true,
    yearsOfExperience: 20,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
  },
  {
    id: '4',
    name: 'Ayşe Öztürk',
    displayName: 'Ayşe Öztürk',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Mentor in entrepreneurship and business development. I have consulted for 50+ startups.',
    title: 'Entrepreneurship Coach',
    company: 'Startup Academy',
    location: 'Bursa, Turkey',
    rating: 4.9,
    reviewCount: 156,
    studentsCount: 421,
    expertise: ['Entrepreneurship', 'Business Plan', 'Funding', 'Networking'],
    achievements: ['Entrepreneur of the Year', 'Startup Mentor Award'],
    isVerified: true,
    yearsOfExperience: 10,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400',
  },
  {
    id: '5',
    name: 'Can Arslan',
    displayName: 'Can Arslan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Expert in design and UX/UI. I have worked at companies like Apple and Google.',
    title: 'Senior Product Designer',
    company: 'Design Studio',
    location: 'Antalya, Turkey',
    rating: 4.8,
    reviewCount: 94,
    studentsCount: 278,
    expertise: ['UI/UX Design', 'Product Design', 'Figma', 'Prototyping'],
    achievements: ['Apple Design Award', 'Dribbble Top Designer'],
    isVerified: true,
    yearsOfExperience: 8,
    image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
  },
  {
    id: '6',
    name: 'Elif Şahin',
    displayName: 'Elif Şahin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    bio: 'Consultant in human resources and career development. I have guided thousands of people in their career journey.',
    title: 'Career Development Coach',
    company: 'Career Hub',
    location: 'Adana, Turkey',
    rating: 4.6,
    reviewCount: 178,
    studentsCount: 512,
    expertise: ['Career Development', 'CV Writing', 'Interview Preparation', 'LinkedIn'],
    achievements: ['HR Excellence Award', 'Career Coach of the Year'],
    isVerified: true,
    yearsOfExperience: 14,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
  },
  {
    id: '7',
    name: 'David Chen',
    displayName: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    bio: 'Data science and machine learning expert with 10 years of experience. Former data scientist at Google and Meta.',
    title: 'Senior Data Scientist',
    company: 'AI Innovations Lab',
    location: 'San Francisco, USA',
    rating: 4.9,
    reviewCount: 234,
    studentsCount: 567,
    expertise: ['Data Science', 'Machine Learning', 'Python', 'Deep Learning'],
    achievements: ['Kaggle Grandmaster', 'Published 20+ Research Papers'],
    isVerified: true,
    yearsOfExperience: 10,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  },
  {
    id: '8',
    name: 'Maria Rodriguez',
    displayName: 'Maria Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    bio: 'Sales and business development expert. Helped 100+ companies scale their revenue from zero to millions.',
    title: 'VP of Sales',
    company: 'Growth Partners',
    location: 'New York, USA',
    rating: 4.8,
    reviewCount: 189,
    studentsCount: 423,
    expertise: ['Sales Strategy', 'Business Development', 'B2B Sales', 'Revenue Growth'],
    achievements: ['Top Sales Leader 2023', 'Generated $50M+ in Revenue'],
    isVerified: true,
    yearsOfExperience: 16,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    id: '9',
    name: 'James Wilson',
    displayName: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Leadership and executive coaching specialist. Trained C-suite executives at Fortune 500 companies.',
    title: 'Executive Coach',
    company: 'Leadership Institute',
    location: 'London, UK',
    rating: 4.9,
    reviewCount: 156,
    studentsCount: 289,
    expertise: ['Leadership', 'Executive Coaching', 'Team Building', 'Strategic Planning'],
    achievements: ['ICF Certified Coach', 'Forbes Coaches Council'],
    isVerified: true,
    yearsOfExperience: 18,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
  },
  {
    id: '10',
    name: 'Sophie Martin',
    displayName: 'Sophie Martin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Content marketing and SEO expert. Built content strategies that generated millions of organic traffic.',
    title: 'Content Marketing Director',
    company: 'Content Masters',
    location: 'Paris, France',
    rating: 4.7,
    reviewCount: 201,
    studentsCount: 445,
    expertise: ['Content Marketing', 'SEO', 'Content Strategy', 'Copywriting'],
    achievements: ['Content Marketer of the Year', '10M+ Organic Traffic Generated'],
    isVerified: true,
    yearsOfExperience: 11,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    id: '11',
    name: 'Robert Kim',
    displayName: 'Robert Kim',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Product management expert with experience at top tech companies. Launched 50+ successful products.',
    title: 'Senior Product Manager',
    company: 'Tech Products Inc.',
    location: 'Seattle, USA',
    rating: 4.8,
    reviewCount: 167,
    studentsCount: 378,
    expertise: ['Product Management', 'Product Strategy', 'Agile', 'User Research'],
    achievements: ['Product Manager of the Year', 'Launched 50+ Products'],
    isVerified: true,
    yearsOfExperience: 12,
    image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
  },
  {
    id: '12',
    name: 'Emma Thompson',
    displayName: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Full-stack development instructor. Teaching web development for 8 years with focus on modern frameworks.',
    title: 'Senior Full-Stack Developer',
    company: 'Code Academy',
    location: 'Toronto, Canada',
    rating: 4.9,
    reviewCount: 312,
    studentsCount: 892,
    expertise: ['Full-Stack Development', 'React', 'Node.js', 'TypeScript'],
    achievements: ['Best Instructor Award', '10K+ Students Taught'],
    isVerified: true,
    yearsOfExperience: 8,
    image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400',
  },
];
