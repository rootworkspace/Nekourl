import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clipboard, Check, Link as LinkIcon, ExternalLink } from "lucide-react";

function App() {
  const [url, setUrl] = useState("");
  const [shortId, setShortId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setShortId("");

    try {
      const res = await fetch(`/u/?url=${encodeURIComponent(url)}`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid URL");

      setShortId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = `${window.location.origin}/u/${text}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setUrl("");
    setShortId("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary/30 selection:text-primary p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Updated Header with Link Icon */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <LinkIcon className="text-primary-foreground h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">nekourl</h1>
          </div>
        </header>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Shorten URL</CardTitle>
            <CardDescription>Enter a long link to make it concise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleShorten} className="space-y-4">
              <div className="relative group">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <Input
                  type="url"
                  placeholder="https://example.com/very-long-link..."
                  className="pl-10 bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary h-12 font-mono text-sm"
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-mono bg-red-500/10 p-2 rounded border border-red-500/20">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={!url || loading}
                className="w-full h-11 font-bold shadow-lg shadow-primary/10"
              >
                {loading ? "Processing..." : "Shorten Link"}
              </Button>
            </form>

            {shortId && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Result</span>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between gap-4">
                  <p className="text-sm font-mono text-primary truncate select-all">
                    {window.location.host}/u/{shortId}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-zinc-800 hover:bg-zinc-900"
                      onClick={() => window.open(`/u/${shortId}`, '_blank')}
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(shortId)}
                      className="h-8 px-3"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;