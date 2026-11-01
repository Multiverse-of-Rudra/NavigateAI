import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center py-12">

      <LoaderCircle
        className="animate-spin h-12 w-12
        text-cyan-500"
      />

    </div>
  );
}