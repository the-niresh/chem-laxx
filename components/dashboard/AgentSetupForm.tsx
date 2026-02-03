"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface AgentSetupFormProps {
  agentId: Id<"agents">;
  model: string;
}

interface FormData {
  webhookUrl: string;
  username?: string;
  password?: string;
  secretKey: string;
}

export function AgentSetupForm({ agentId, model }: AgentSetupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completeAgentSetup = useMutation(api.agents.completeAgentSetup);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      webhookUrl: '',
      username: '',
      password: '',
      secretKey: '',
    },
    resolver: async (data) => {
      const errors: Partial<Record<keyof FormData, { type: string, message: string }>> = {};
      
      if (!data.webhookUrl) {
        errors.webhookUrl = { type: 'required', message: 'Webhook URL is required' };
      }
      
      if (!data.secretKey) {
        errors.secretKey = { type: 'required', message: 'Secret key is required (min 32 characters)' };
      } else if (data.secretKey.length < 32) {
        errors.secretKey = { type: 'minLength', message: 'Secret key must be at least 32 characters' };
      }
      
      return { values: data, errors };
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Complete the agent setup with webhook details
      const result = await completeAgentSetup({
        agent_id: agentId,
        webhook_url: data.webhookUrl,
        webhook_username_jwe: data.username || undefined,
        webhook_pass_jwe: data.password || undefined,
        secret_key_jwe: data.secretKey,
      });

      console.log("Agent setup completed:", result);
      
      // Redirect to the agent dashboard
      router.push(`/dashboard/${model}/${agentId}`);
    } catch (error) {
      console.error("Failed to complete agent setup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Agent Setup</CardTitle>
        <CardDescription>
          Your payment was successful! Now, let&apos;s configure your agent&apos;s webhook details.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input id="webhookUrl" {...register("webhookUrl")} />
            {errors.webhookUrl && <p className="text-sm text-red-500">{errors.webhookUrl.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username (Optional)</Label>
            <Input id="username" {...register("username")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password (Optional)</Label>
            <Input id="password" type="password" {...register("password")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input id="secretKey" {...register("secretKey")} />
            {errors.secretKey && <p className="text-sm text-red-500">{errors.secretKey.message}</p>}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Setting Up..." : "Complete Setup"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
