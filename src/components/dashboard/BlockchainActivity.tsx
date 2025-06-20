import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Database } from "lucide-react";
import { format } from "date-fns";

interface BlockchainEvent {
  id: string;
  type: "access" | "update" | "create" | "permission" | "upload" | "delete" | "billing";
  actor: string;
  target: string;
  status: "success" | "pending" | "rejected";
  timestamp: Date;
}

interface BlockchainActivityProps {
  events: BlockchainEvent[];
}

export default function BlockchainActivity({ events }: BlockchainActivityProps) {
  const getEventIcon = (type: BlockchainEvent["type"]) => {
    switch (type) {
      case "access":
        return "🔍";
      case "update":
        return "✏️";
      case "create":
        return "📄";
      case "permission":
        return "🔐";
      case "upload":
        return "📤";
      case "delete":
        return "🗑️";
      case "billing":
        return "💰";
      default:
        return "📝";
    }
  };
  
  const getEventLabel = (type: BlockchainEvent["type"]) => {
    switch (type) {
      case "access":
        return "Record Access";
      case "update":
        return "Record Update";
      case "create":
        return "Record Creation";
      case "permission":
        return "Permission Change";
      case "upload":
        return "File Upload";
      case "delete":
        return "Record Deletion";
      case "billing":
        return "Medical Bill";
      default:
        return "Activity";
    }
  };
  
  const getStatusBadge = (status: BlockchainEvent["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-medblue-600" />
            <CardTitle>Blockchain Activity</CardTitle>
          </div>
          <CardDescription>
            Recent activities recorded on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[200px]">When</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No blockchain activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <span className="font-medium">{getEventLabel(event.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{event.actor}</p>
                          <p className="text-xs text-muted-foreground">{event.target}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {format(event.timestamp, "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
