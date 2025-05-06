import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit2, 
  Save, 
  X,
  Heart,
  Activity,
  Pill,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  fullName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  address: string;
  medicalHistory: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export default function ProfileTab() {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: profile?.full_name || "",
    age: profile?.age || 0,
    gender: profile?.gender || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    medicalHistory: profile?.medical_history || "",
    allergies: profile?.allergies || [],
    medications: profile?.medications || [],
    conditions: profile?.conditions || []
  });

  const handleInputChange = (field: keyof ProfileData, value: string | number | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update the profile
      // For now, we'll just show a success message
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal information and medical history
          </p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} alt={profileData.fullName} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profileData.fullName}</CardTitle>
            <CardDescription>Patient ID: {profile?.id?.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profileData.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.fullName}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                {isEditing ? (
                  <Input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.age} years</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <Select
                    value={profileData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{profileData.gender}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Your medical conditions, allergies, and medications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History Summary</Label>
              {isEditing ? (
                <Textarea
                  id="medicalHistory"
                  value={profileData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profileData.medicalHistory}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Conditions</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                    >
                      <Activity className="h-3 w-3" />
                      <span>{condition}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
                    >
                      <Heart className="h-3 w-3" />
                      <span>{allergy}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medications</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.medications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      <Pill className="h-3 w-3" />
                      <span>{medication}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
} 