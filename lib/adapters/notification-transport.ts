import "server-only";

export type NotificationEmail = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

export interface NotificationTransport {
  name: string;
  // An approved adapter must use this key for provider-level deduplication and
  // enforce a finite network timeout. Acceptance is not inbox delivery.
  send(email: NotificationEmail, idempotencyKey: string): Promise<{
    status: "accepted" | "test_captured";
    messageId: string;
  }>;
}

export function getNotificationTransport(): NotificationTransport | null {
  // This project has no live email provider. Never turn an outbox insert or a
  // console log into a successful send. Tests inject an in-memory transport.
  // Add an approved provider here only after sender/domain setup is agreed.
  switch (process.env.NOTIFICATION_TRANSPORT || "outbox") {
    case "outbox":
    default:
      return null;
  }
}
