
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar, Clock, UserPlus, X, Filter } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    doctorName: "Dr. Sarah Johnson",
    date: "2025-05-15",
    time: "10:00 AM",
    reason: "Annual check-up",
    status: "scheduled"
  },
  {
    id: 2,
    doctorName: "Dr. Michael Chen",
    date: "2025-05-22",
    time: "3:30 PM",
    reason: "Follow-up appointment",
    status: "scheduled"
  },
  {
    id: 3,
    doctorName: "Dr. Emily Rodriguez",
    date: "2025-04-10",
    time: "9:15 AM",
    reason: "Blood work",
    status: "completed"
  }
];

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorName: "",
    date: "",
    time: "",
    reason: ""
  });

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    timeFrom: "",
    timeTo: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAppointment({ ...newAppointment, [name]: value });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      timeFrom: "",
      timeTo: ""
    });
  };

  const handleCreateAppointment = () => {
    // Basic validation
    if (!newAppointment.doctorName || !newAppointment.date || !newAppointment.time || !newAppointment.reason) {
      toast.error("Please fill in all fields");
      return;
    }

    const appointment: Appointment = {
      id: appointments.length + 1,
      doctorName: newAppointment.doctorName,
      date: newAppointment.date,
      time: newAppointment.time,
      reason: newAppointment.reason,
      status: "scheduled"
    };

    setAppointments([...appointments, appointment]);
    toast.success("Appointment scheduled successfully");
    
    // Reset form and close dialog
    setNewAppointment({
      doctorName: "",
      date: "",
      time: "",
      reason: ""
    });
    setIsDialogOpen(false);
  };

  const handleCancelAppointment = (id: number) => {
    setAppointments(
      appointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: "cancelled" as const } 
          : appointment
      )
    );
    toast.success("Appointment cancelled");
  };

  // Convert time string to 24-hour format for comparison
  const convertTo24Hour = (timeStr: string): string => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  // Filter appointments based on date and time
  const getFilteredAppointments = (appointmentsList: Appointment[]) => {
    return appointmentsList.filter(appointment => {
      // Date filters
      if (filters.startDate && appointment.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && appointment.date > filters.endDate) {
        return false;
      }
      
      // Time filters
      if (filters.timeFrom || filters.timeTo) {
        const appointmentTime24 = convertTo24Hour(appointment.time);
        
        if (filters.timeFrom && appointmentTime24 < filters.timeFrom) {
          return false;
        }
        if (filters.timeTo && appointmentTime24 > filters.timeTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredAppointments = getFilteredAppointments(appointments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Appointments</h2>
          <p className="text-muted-foreground">
            Schedule and manage your healthcare appointments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Enter the details for your new appointment below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  name="doctorName"
                  value={newAppointment.doctorName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={newAppointment.reason}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAppointment}>
                Schedule Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filter Appointments</CardTitle>
          </div>
          <CardDescription>
            Filter appointments by date range and time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeFrom">Time From</Label>
              <Input
                id="timeFrom"
                name="timeFrom"
                type="time"
                value={filters.timeFrom}
                onChange={handleFilterChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeTo">Time To</Label>
              <Input
                id="timeTo"
                name="timeTo"
                type="time"
                value={filters.timeTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Upcoming Appointments</CardTitle>
          </div>
          <CardDescription>
            Your scheduled healthcare visits
            {(filters.startDate || filters.endDate || filters.timeFrom || filters.timeTo) && 
              ` (${filteredAppointments.filter(app => app.status !== "cancelled").length} of ${appointments.filter(app => app.status !== "cancelled").length} shown)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments
                .filter(app => app.status !== "cancelled")
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>
                    {appointment.status === "completed" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Completed
                      </span>
                    ) : appointment.status === "cancelled" ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Scheduled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {appointment.status === "scheduled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredAppointments.filter(app => app.status !== "cancelled").length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {(filters.startDate || filters.endDate || filters.timeFrom || filters.timeTo) 
                      ? "No appointments match your filters"
                      : "No upcoming appointments. Schedule one now!"
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {appointments.some(app => app.status === "cancelled") && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              <CardTitle>Cancelled Appointments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments
                  .filter(app => app.status === "cancelled")
                  .map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{formatDate(appointment.date)}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Cancelled
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
