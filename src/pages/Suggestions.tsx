import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Suggestions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoadingSuggestions(true);
    supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSuggestions(data || []);
        setLoadingSuggestions(false);
      });
  }, [user, submitting]);

  const handleSuggestionInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSuggestionForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!suggestionForm.title.trim() || !suggestionForm.description.trim() || !suggestionForm.category.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('suggestions').insert({
      user_id: user.id,
      title: suggestionForm.title.trim(),
      description: suggestionForm.description.trim(),
      category: suggestionForm.category.trim(),
    });
    if (error) {
      setFormError(error.message);
    } else {
      toast({ title: 'Suggestion submitted!', description: 'Thank you for your feedback.' });
      setSuggestionForm({ title: '', description: '', category: '' });
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
            <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Suggestions</h1>
            <p className="text-muted-foreground">Share your ideas to improve the app</p>
          </div>
        </div>
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle>Submit a Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <Input
                name="title"
                placeholder="Title"
                value={suggestionForm.title}
                onChange={handleSuggestionInput}
                maxLength={60}
                required
              />
              <Textarea
                name="description"
                placeholder="Describe your suggestion..."
                value={suggestionForm.description}
                onChange={handleSuggestionInput}
                rows={3}
                maxLength={300}
                required
              />
              <Select value={suggestionForm.category} onValueChange={val => setSuggestionForm(f => ({ ...f, category: val }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formError && <div className="text-destructive text-sm">{formError}</div>}
              <Button type="submit" className="w-full btn-gradient" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSuggestions ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : suggestions.length === 0 ? (
              <div className="text-muted-foreground text-sm">No suggestions yet.</div>
            ) : (
              <div className="space-y-2">
                {suggestions.map(s => (
                  <Card key={s.id} className="bg-muted/40 border-none shadow-none">
                    <CardContent className="py-2 px-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{s.title}</div>
                        <span className="text-xs text-muted-foreground">{s.category}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</div>
                      <div className="text-xs text-muted-foreground mt-1 text-right">
                        {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Suggestions; 