import EditVillaClient from "@/components/admin/villas/EditVillaClient";

export default async function EditVillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditVillaClient id={id} />;
}
