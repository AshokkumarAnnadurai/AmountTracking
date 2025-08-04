"use client";

import * as React from "react";
import {
  Landmark,
  ReceiptText,
  Scale,
  MessageCircle,
  Copy,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateWhatsappSummary } from "@/ai/flows/generate-whatsapp-summary";
import type { Program } from "@/lib/types";

interface SummaryCardsProps {
  totalCollection: number;
  totalExpenses: number;
  remainingBalance: number;
  programs: Program[];
}

export function SummaryCards({
  totalCollection,
  totalExpenses,
  remainingBalance,
  programs,
}: SummaryCardsProps) {
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [summary, setSummary] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return `Rs ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
    }).format(amount)}`;
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary("");
    try {
      const result = await generateWhatsappSummary({
        totalCollection,
        totalExpenses,
        remainingBalance,
        eventList: programs.map((p) => p.name),
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard.",
    });
  };

  const handleShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collection
            </CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCollection)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total contributions received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount spent so far
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Balance
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(remainingBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cash in hand for expenses
            </p>
          </CardContent>
        </Card>
        <Button
          variant="default"
          className="h-full w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold"
          onClick={() => {
            setDialogOpen(true);
            handleGenerateSummary();
          }}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Share Summary
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Festival Summary</DialogTitle>
            <DialogDescription>
              Share this AI-generated summary with villagers on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-md border border-dashed h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Textarea
                readOnly
                value={summary}
                className="h-40 resize-none"
                placeholder="AI-generated summary will appear here..."
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!summary || isLoading}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button
              onClick={handleShare}
              disabled={!summary || isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
