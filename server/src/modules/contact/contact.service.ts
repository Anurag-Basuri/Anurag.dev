import sanitizeHtml from "sanitize-html";
import { prisma } from "../../lib/db";

export async function submitContact(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  ip?: string;
}) {
  const clean = {
    name: sanitizeHtml(payload.name, {
      allowedTags: [],
      allowedAttributes: {},
    }),
    email: sanitizeHtml(payload.email, {
      allowedTags: [],
      allowedAttributes: {},
    }),
    subject: sanitizeHtml(payload.subject || "", {
      allowedTags: [],
      allowedAttributes: {},
    }),
    message: sanitizeHtml(payload.message, {
      allowedTags: [],
      allowedAttributes: {},
    }),
  };

  const record = await prisma.contactMessage.create({
    data: {
      name: clean.name,
      email: clean.email,
      subject: clean.subject,
      message: clean.message,
      ipAddress: payload.ip || "unknown",
    },
  });

  // In production: enqueue email send job; here we just return record
  return record;
}
