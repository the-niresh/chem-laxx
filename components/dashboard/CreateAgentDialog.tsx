// components/CreateAgentDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

interface DialogDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  agentName: string;
  model: string;
}

export function CreateAgentDialog({ open, onOpenChange }: DialogDemoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      agentName: "",
      model: "",
    },
    resolver: async (data) => {
      const errors: Partial<Record<keyof FormData, { type: string; message: string }>> = {};
      if (!data.agentName) {
        errors.agentName = { type: "required", message: "Agent name is required" };
      }
      if (!data.model) {
        errors.model = { type: "required", message: "Model selection is required" };
      }
      return { values: data, errors };
    },
    mode: "onSubmit",
  });
  const user = useQuery(api.users.getCurrentUser);
  const createPendingAgent = useMutation(api.pendingAgents.createPendingAgent);
  const updatePendingAgentSubscription = useMutation(api.pendingAgents.updatePendingAgentSubscription);
  // react-hot-toast is imported directly

  const onSubmit = async (data: FormData) => {
    if (!user?.user_id) {
      toast.error("You need to be logged in to create an agent.");
      window.location.href = "/login";
      return;
    }

    try {
      setIsSubmitting(true);

      // Store pending agent data in Convex
      const pendingAgentId = await createPendingAgent({
        user_id: user.user_id,
        agent_name: data.agentName,
        model: data.model as "chat" | "convo" | "form",
      });

      // Create a payment link using Convex HTTP endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName: data.agentName,
          model: data.model,
          userId: user.user_id,
          email: user.email,
          name: user.name || "",
          currentPathName: window.location.pathname,
          pendingAgentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment link");
      }

      const result = await response.json();
      const { subscription } = result;

      if (!subscription || !subscription.payment_link) {
        throw new Error("No payment link returned from server");
      }

      // Update pending agent with subscription ID
      await updatePendingAgentSubscription({
        pendingAgentId,
        subscription_id: subscription.subscription_id,
      });

      // Update the payment link to redirect to /payment-callback
      const paymentLink = new URL(subscription.payment_link);
      paymentLink.searchParams.set("return_path", window.location.pathname);
      paymentLink.searchParams.set("pendingAgentId", pendingAgentId);
      window.location.href = paymentLink.toString();
    } catch (error) {
      console.error("Payment link creation error:", error);
      toast.error(`Failed to create payment link: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Enter basic information to proceed to payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input id="agentName" {...register("agentName")} />
                {errors.agentName && (
                  <p className="text-sm text-red-500">{errors.agentName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select onValueChange={(value) => setValue("model", value)} defaultValue={watch("model")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat Model</SelectItem>
                    <SelectItem value="convo">Convo Model</SelectItem>
                    <SelectItem value="form">Custom Form</SelectItem>
                  </SelectContent>
                </Select>
                {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}