import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  RefreshCw, 
  Users, 
  Mail, 
  Phone, 
  Crown, 
  FileText, 
  Eye, 
  Download,
  Calendar,
  UserCheck,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface UserData {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  membership_tier: string;
  user_cookie_id: string;
  is_new_user: boolean;
  account_created_date: string;
  last_login_date: string;
  login_count: number;
  user_agent: string;
  ip_address: string;
  user_location: string;
}

interface PersonalityReport {
  personality_report: string;
  user_cookie_id: string;
  is_new_user: boolean;
  first_visit_date: string;
  last_visit_date: string;
  visit_count: number;
  user_agent: string;
  ip_address: string;
  user_location: string;
}

interface CombinedUserData {
  user: UserData;
  hasReport: boolean;
  report?: PersonalityReport;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [personalityReports, setPersonalityReports] = useState<PersonalityReport[]>([]);
  const [combinedData, setCombinedData] = useState<CombinedUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<CombinedUserData | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PersonalityReport | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users and reports in parallel
      const [usersResponse, reportsResponse] = await Promise.all([
        fetch('/api/user/all-users'),
        fetch('/api/personality/reports')
      ]);
      
      if (!usersResponse.ok || !reportsResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const usersData = await usersResponse.json();
      const reportsData = await reportsResponse.json();
      
      if (usersData.success && reportsData.success) {
        setUsers(usersData.users || []);
        setPersonalityReports(reportsData.reports || []);
        
        // Combine user data with report data
        const combined = usersData.users.map((user: UserData) => {
          const report = reportsData.reports.find((r: PersonalityReport) => 
            r.user_cookie_id === user.user_cookie_id
          );
          
          return {
            user,
            hasReport: !!report,
            report
          };
        });
        
        setCombinedData(combined);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error connecting to server. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search term
  const filteredData = combinedData.filter(item =>
    item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.phone.includes(searchTerm) ||
    item.user.membership_tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalUsers = users.length;
  const totalReports = personalityReports.length;
  const usersWithReports = combinedData.filter(item => item.hasReport).length;
  const newUsers = users.filter(user => user.is_new_user).length;
  const returningUsers = users.filter(user => !user.is_new_user).length;
  
  const today = new Date().toDateString();
  const todayRegistrations = users.filter(user => 
    new Date(user.account_created_date).toDateString() === today
  ).length;

  const handleViewUserDetail = (userData: CombinedUserData) => {
    setSelectedUser(userData);
    setIsUserDetailOpen(true);
  };

  const handleViewReport = (report: PersonalityReport) => {
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`/api/user/delete/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh data after deletion
        fetchData();
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error deleting user');
    }
  };

  const exportToCSV = (data: Array<Record<string, unknown>>, filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and view reports</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => exportToCSV(users, 'users.csv')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
              <Button onClick={() => exportToCSV(personalityReports, 'personality_reports.csv')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {newUsers} new, {returningUsers} returning
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Total Reports
            </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">
                {usersWithReports} users have reports
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Users with Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersWithReports}</div>
              <p className="text-xs text-muted-foreground">
                {totalUsers > 0 ? Math.round((usersWithReports / totalUsers) * 100) : 0}% coverage
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Today's Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                New accounts today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, phone, or membership tier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users ({totalUsers})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({totalReports})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combinedData.slice(0, 5).map((item) => (
                      <div key={item.user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.user.name}</p>
                          <p className="text-sm text-gray-600">{item.user.email}</p>
                          <p className="text-xs text-gray-500">{item.user.membership_tier}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.hasReport && (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Report
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUserDetail(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {personalityReports.slice(0, 5).map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">User: {report.user_cookie_id.slice(0, 8)}...</p>
                          <p className="text-sm text-gray-600">
                            {report.is_new_user ? 'New User' : 'Returning User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Visits: {report.visit_count}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredData.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Phone</th>
                          <th className="text-left p-3 font-medium">Membership</th>
                          <th className="text-left p-3 font-medium">Report Status</th>
                          <th className="text-left p-3 font-medium">Joined</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item) => (
                          <tr key={item.user.user_id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div className="font-medium">{item.user.name}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                {item.user.email}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                {item.user.phone}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Crown className="h-4 w-4 mr-2 text-muted-foreground" />
                                <Badge variant="outline">{item.user.membership_tier || 'None'}</Badge>
                              </div>
                            </td>
                            <td className="p-3">
                              {item.hasReport ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Has Report
                                </Badge>
                              ) : (
                                <Badge variant="secondary">No Report</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">
                                {new Date(item.user.account_created_date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewUserDetail(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {item.user.name}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(item.user.user_id, item.user.name)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personality Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {personalityReports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No personality reports available yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">User ID</th>
                          <th className="text-left p-3 font-medium">User Type</th>
                          <th className="text-left p-3 font-medium">Visit Count</th>
                          <th className="text-left p-3 font-medium">First Visit</th>
                          <th className="text-left p-3 font-medium">Last Visit</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personalityReports.map((report, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div className="font-mono text-sm">
                                {report.user_cookie_id.slice(0, 12)}...
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={report.is_new_user ? "default" : "secondary"}>
                                {report.is_new_user ? 'New User' : 'Returning User'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="text-center">
                                <Badge variant="outline">{report.visit_count}</Badge>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">
                                {new Date(report.first_visit_date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">
                                {new Date(report.last_visit_date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Report
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-sm text-gray-900">{selectedUser.user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-sm text-gray-900">{selectedUser.user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <p className="text-sm text-gray-900">{selectedUser.user.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Membership Tier</Label>
                  <p className="text-sm text-gray-900">{selectedUser.user.membership_tier || 'None'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Account Created</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.user.account_created_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.user.last_login_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Login Count</Label>
                  <p className="text-sm text-gray-900">{selectedUser.user.login_count}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">User Type</Label>
                  <Badge variant={selectedUser.user.is_new_user ? "default" : "secondary"}>
                    {selectedUser.user.is_new_user ? 'New User' : 'Returning User'}
                  </Badge>
                </div>
              </div>
              
              {selectedUser.hasReport && selectedUser.report && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Personality Report Available</h4>
                  <Button
                    onClick={() => {
                      setIsUserDetailOpen(false);
                      handleViewReport(selectedUser.report!);
                    }}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Detail Dialog */}
      <Dialog open={isReportDetailOpen} onOpenChange={setIsReportDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personality Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">User ID</Label>
                  <p className="text-sm text-gray-900 font-mono">{selectedReport.user_cookie_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">User Type</Label>
                  <Badge variant={selectedReport.is_new_user ? "default" : "secondary"}>
                    {selectedReport.is_new_user ? 'New User' : 'Returning User'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Visit Count</Label>
                  <p className="text-sm text-gray-900">{selectedReport.visit_count}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">First Visit</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.first_visit_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Visit</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.last_visit_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">IP Address</Label>
                  <p className="text-sm text-gray-900">{selectedReport.ip_address || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Personality Report Content</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedReport.personality_report || 'No report content available'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard; 