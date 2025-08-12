import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const STATUS_COLORS = {
  pending: 'bg-gray-200 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  fixed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  wont_fix: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  rejected: 'Rejected',
  wont_fix: 'Wont Fix',
};

const BugReportDialog = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [bugReports, setBugReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user) fetchBugReports();
  }, [user, open]);

  const fetchBugReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setBugReports(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('bug_reports')
      .insert({
        user_id: user.id,
        category: formData.category,
        description: formData.description.trim(),
      });
    setLoading(false);
    if (!error) {
      setFormData({ category: '', description: '' });
      fetchBugReports();
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
              placeholder="UI, Performance, Crash, etc."
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the bug in detail..."
              rows={3}
              required
            />
          </div>
          <Button type="submit" className="btn-gradient w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Bug Report'}
          </Button>
        </form>
        <div className="mb-2 font-semibold text-lg">My Bug Reports</div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : bugReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">You haven’t reported any bugs yet.</div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {bugReports.map(report => (
              <Card key={report.id}>
                <CardHeader className="flex flex-col gap-1 cursor-pointer" onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{report.category}</Badge>
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${STATUS_COLORS[report.status] || 'bg-gray-200 text-gray-700'}`}>{STATUS_LABELS[report.status] || report.status}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{formatDate(report.created_at)}</span>
                  </div>
                  <div className="font-medium truncate max-w-xs">{report.description}</div>
                </CardHeader>
                {expandedId === report.id && (
                  <CardContent>
                    <div className="mb-2 whitespace-pre-line">{report.description}</div>
                    {report.response && (
                      <div className="bg-muted p-3 rounded-lg mt-2">
                        <div className="font-semibold mb-1">Response:</div>
                        <div>{report.response}</div>
                        {report.responded_at && <div className="text-xs text-muted-foreground mt-1">{formatDate(report.responded_at)}</div>}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BugReportDialog;