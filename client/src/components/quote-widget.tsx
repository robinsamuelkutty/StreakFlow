import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "It's not what we do once in a while that shapes our lives. It's what we do consistently.", author: "Tony Robbins" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Excellence is not a singular act, but a habit. You are what you repeatedly do.", author: "Shaquille O'Neal" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
];

export function QuoteWidget() {
  const quote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return quotes[dayOfYear % quotes.length];
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5" data-testid="card-quote">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Quote className="w-6 h-6 text-primary shrink-0 mt-1" />
          <div>
            <p className="text-base font-medium leading-relaxed" data-testid="text-quote">
              "{quote.text}"
            </p>
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-quote-author">
              — {quote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
