import { useState } from 'react';
import { Search, Edit, Upload, Box, Camera, Video, Image as ImageIcon, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

// Mock data
const mockVenues = [
  {
    id: '1',
    name: 'Coffee House',
    category: 'Café',
    address: '123 Main St, Miami, FL',
    rating: 4.5,
    status: 'active',
    has3D: true,
    hasAR: true,
    menuItems: 15,
    images: 8,
    videos: 2,
  },
  {
    id: '2',
    name: 'Fine Dining Restaurant',
    category: 'Restaurant',
    address: '456 Ocean Dr, Miami, FL',
    rating: 4.8,
    status: 'active',
    has3D: false,
    hasAR: true,
    menuItems: 25,
    images: 12,
    videos: 1,
  },
];

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const filteredVenues = mockVenues.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Venues</h1>
          <p className="text-muted-foreground mt-1">Manage restaurants, cafes, and venues</p>
        </div>
        <Button>Add New Venue</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search venues by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Venues List */}
      <div className="grid gap-4">
        {filteredVenues.map((venue) => (
          <Card key={venue.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* Venue Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150`}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Venue Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{venue.name}</h3>
                        <Badge>{venue.category}</Badge>
                        <Badge variant={venue.status === 'active' ? 'default' : 'outline'}>
                          {venue.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{venue.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Rating: {venue.rating} ⭐</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{venue.menuItems} menu items</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVenue(venue);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVenue(venue);
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Media
                      </Button>
                    </div>
                  </div>

                  {/* 3D/AR & Media Status */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">3D Model:</span>
                      {venue.has3D ? (
                        <Badge variant="default" className="bg-green-500">Available</Badge>
                      ) : (
                        <Badge variant="outline">Not Available</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">AR:</span>
                      {venue.hasAR ? (
                        <Badge variant="default" className="bg-green-500">Available</Badge>
                      ) : (
                        <Badge variant="outline">Not Available</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{venue.images} images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{venue.videos} videos</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
            <DialogDescription>Update venue information</DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input defaultValue={selectedVenue.name} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input defaultValue={selectedVenue.category} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea defaultValue={selectedVenue.address} />
              </div>
              <div className="flex gap-4">
                <Button className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Media Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>Add images, videos, or 3D/AR models for {selectedVenue?.name}</DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span>Upload Images</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Video className="w-6 h-6" />
                  <span>Upload Videos</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Box className="w-6 h-6" />
                  <span>Upload 3D/AR</span>
                </Button>
              </div>
              <div className="flex gap-4">
                <Button className="flex-1">Upload</Button>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
