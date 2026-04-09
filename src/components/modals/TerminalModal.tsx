import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Terminal } from "@/types";

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (terminal: any) => void;
  terminal?: Terminal | null;
}

export default function TerminalModal({
  isOpen,
  onClose,
  onSave,
  terminal,
}: TerminalModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    lat: "",
    lng: "",
    radius: 50,
  });

  useEffect(() => {
    if (terminal) {
      setFormData({
        name: terminal.name || "",
        lat: terminal.lat?.toString() || "",
        lng: terminal.lng?.toString() || "",
        radius: terminal.radius || 50,
      });
    } else {
      setFormData({
        name: "",
        lat: "",
        lng: "",
        radius: 50,
      });
    }
  }, [terminal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      radius: parseInt(formData.radius.toString()),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02404F] sm:ml-3 sm:w-auto sm:text-sm"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="terminalForm"
        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#02404F] text-base font-medium text-white hover:bg-[#036b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02404F] sm:ml-3 sm:w-auto sm:text-sm"
      >
        {terminal ? "Update" : "Save"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={terminal ? "Edit Terminal" : "Add Terminal"}
      footer={footer}
    >
      <form id="terminalForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Terminal Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lat"
            className="block text-sm font-medium text-gray-700"
          >
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            name="lat"
            id="lat"
            required
            value={formData.lat}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lng"
            className="block text-sm font-medium text-gray-700"
          >
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            name="lng"
            id="lng"
            required
            value={formData.lng}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="radius"
            className="block text-sm font-medium text-gray-700"
          >
            Radius (meters)
          </label>
          <input
            type="number"
            name="radius"
            id="radius"
            min="10"
            max="500"
            required
            value={formData.radius}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>
      </form>
    </Modal>
  );
}
