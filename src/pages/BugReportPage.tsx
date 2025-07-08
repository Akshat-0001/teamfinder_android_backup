import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BugReportPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    description: '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    if (!form.description.trim() || !form.category.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('bug_reports').insert({
      user_id: user?.id || null,
      description: form.description.trim(),
      category: form.category.trim(),
    });
    if (error) {
      setFormError(error.message);
    } else {
      setSuccess('Bug report submitted! Thank you.');
      setForm({ description: '', category: '' });
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 pb-20 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bug className="h-6 w-6 text-primary" /> Report a Bug</h1>
            <p className="text-muted-foreground">Help us squash bugs and improve the app</p>
          </div>
        </div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Bug Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                name="description"
                placeholder="Describe the bug..."
                value={form.description}
                onChange={handleInput}
                rows={3}
                maxLength={300}
                required
              />
              <Select value={form.category} onValueChange={val => setForm(f => ({ ...f, category: val }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="Crash">Crash</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Data Loss">Data Loss</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formError && <div className="text-destructive text-sm">{formError}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full btn-gradient" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Bug Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default BugReportPage; 