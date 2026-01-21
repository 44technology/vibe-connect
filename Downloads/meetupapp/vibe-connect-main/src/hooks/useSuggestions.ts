import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface ClassSuggestion {
  searchedSkill: string;
  suggestedSkills: string[];
  suggestedCategories: string[];
  relevantVenues: Array<{
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    image?: string;
    classCount: number;
    offeredSkills: string[];
  }>;
  categoryVenues: Array<{
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    image?: string;
    classCount: number;
  }>;
}

export const useClassSuggestions = (skill: string, category?: string) => {
  return useQuery({
    queryKey: ['classSuggestions', skill, category],
    queryFn: async () => {
      const params = new URLSearchParams({ skill });
      if (category) params.append('category', category);
      
      const url = `${API_ENDPOINTS.SUGGESTIONS.CLASSES}?${params.toString()}`;
      const response = await apiRequest<{ success: boolean; data: ClassSuggestion }>(url);
      return response.data;
    },
    enabled: !!skill && skill.length > 0,
  });
};

export const useRequestClassSuggestion = () => {
  return useMutation({
    mutationFn: async (data: {
      skill: string;
      category?: string;
      message?: string;
      preferredVenueId?: string;
    }) => {
      const response = await apiRequest<{ success: boolean; message: string; data: any }>(
        API_ENDPOINTS.SUGGESTIONS.REQUEST_CLASS,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return response;
    },
  });
};
