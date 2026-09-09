export const faqs = [
  ["How do I request a courier quote?", "Share your contact, route and parcel details in the quotation form. The team will review your request and contact you with a confirmed offer."],
  ["Does submitting the form confirm my booking?", "No. It creates an enquiry only. A booking is created after a quote has been prepared and accepted."],
  ["Can all international parcels be accepted?", "Acceptance depends on the contents, documentation, route availability and applicable restrictions. These are confirmed for the specific shipment."],
  ["How does tracking work?", "Enter the public VK tracking code issued for a booked shipment. The timeline shows verified manual updates, or partner data when an approved integration is configured."],
  ["Is pickup automatically scheduled?", "No. Pickup requests are currently unavailable. When enabled, a requested date will still need staff confirmation."],
];

export function FaqList({ limit }: { limit?: number }) {
  return <div className="faq-list">{faqs.slice(0, limit).map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>;
}
