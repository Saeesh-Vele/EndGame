import {
  detailTable,
  emailLayout,
  paragraph,
  quotedBlock,
  secondaryLink,
  type EmailTemplate,
} from "./layout";

export interface AdminContactMessageData {
  name: string;
  email: string;
  message: string;
}

/** Sent to the admin inbox when someone uses the contact form on /about. */
export function adminContactMessage(
  data: AdminContactMessageData
): EmailTemplate {
  const body = [
    paragraph(`${data.name} sent a message through the contact form.`),
    detailTable([
      ["Name", data.name],
      ["Email", data.email],
    ]),
    quotedBlock("Message", data.message),
    // mailto rather than a dashboard link — there's no admin screen for
    // contact messages, so replying is the action.
    secondaryLink(`mailto:${data.email}`, `Reply to ${data.name}`),
  ].join("");

  return {
    subject: `New contact message — ${data.name}`,
    html: emailLayout({
      heading: "New contact message",
      preheader: data.message.slice(0, 120),
      body,
    }),
  };
}
