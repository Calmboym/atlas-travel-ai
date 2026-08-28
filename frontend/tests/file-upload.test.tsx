import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { renderWithProviders as render } from "./layout-test-utils";

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  const file = new File(["x".repeat(sizeBytes)], name, { type });
  return file;
}

describe("FileUpload", () => {
  it("associates the label with the hidden file input (single accessible control)", () => {
    render(<FileUpload onFileSelected={vi.fn()} label="Upload a file" />);
    // A single accessible name resolves to the <label>-for-<input>
    // pairing; getByLabelText only succeeds if that native association
    // is correct.
    expect(screen.getByLabelText("Upload a file")).toBeInTheDocument();
  });

  it("calls onFileSelected when a file is chosen", async () => {
    const onFileSelected = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload onFileSelected={onFileSelected} label="Upload" />);

    const input = screen.getByLabelText("Upload") as HTMLInputElement;
    const file = makeFile("photo.png", "image/png");
    await user.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it("rejects a file over maxSizeBytes and calls onError instead of onFileSelected", async () => {
    const onFileSelected = vi.fn();
    const onError = vi.fn();
    const user = userEvent.setup();
    render(
      <FileUpload
        onFileSelected={onFileSelected}
        onError={onError}
        maxSizeBytes={10}
        label="Upload"
        hint="Too big"
      />,
    );

    const input = screen.getByLabelText("Upload") as HTMLInputElement;
    await user.upload(input, makeFile("big.png", "image/png", 1000));

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("Too big");
  });

  it("disabled state prevents the input from accepting focus/interaction", () => {
    render(<FileUpload onFileSelected={vi.fn()} label="Upload" disabled />);
    expect(screen.getByLabelText("Upload")).toBeDisabled();
  });

  it("accepts a dropped file", () => {
    const onFileSelected = vi.fn();
    render(<FileUpload onFileSelected={onFileSelected} label="Upload" />);
    const file = makeFile("dropped.png", "image/png");
    const label = screen.getByLabelText("Upload").closest("label") as HTMLLabelElement;
    fireEvent.drop(label, { dataTransfer: { files: [file] } });
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it("ignores a drop while disabled", () => {
    const onFileSelected = vi.fn();
    render(<FileUpload onFileSelected={onFileSelected} label="Upload" disabled />);
    const file = makeFile("dropped.png", "image/png");
    const label = screen.getByLabelText("Upload").closest("label") as HTMLLabelElement;
    fireEvent.drop(label, { dataTransfer: { files: [file] } });
    expect(onFileSelected).not.toHaveBeenCalled();
  });
});

describe("ImageUpload", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("generates a local preview URL and calls onFileSelected for an image file", async () => {
    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-preview-url");
    URL.revokeObjectURL = vi.fn();

    const onFileSelected = vi.fn();
    const user = userEvent.setup();
    render(<ImageUpload onFileSelected={onFileSelected} label="Change photo" />);

    const file = makeFile("avatar.png", "image/png");
    await user.upload(screen.getByLabelText("Change photo"), file);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(onFileSelected).toHaveBeenCalledWith(file, "blob:mock-preview-url");
  });

  it("rejects a non-image file via onError, without generating a preview", async () => {
    // Not user.upload(): jsdom's userEvent v14 honors the input's
    // accept="image/*" and silently filters non-matching files before
    // they'd ever reach onChange — accurately mirroring how a real OS
    // file picker behaves. Drag-and-drop is the realistic path that
    // actually bypasses accept filtering (native HTML DnD ignores it
    // entirely) and is what ImageUpload's own runtime type check
    // exists to guard.
    URL.createObjectURL = vi.fn();
    const onFileSelected = vi.fn();
    const onError = vi.fn();
    render(
      <ImageUpload onFileSelected={onFileSelected} onError={onError} label="Change photo" />,
    );

    const file = makeFile("doc.pdf", "application/pdf");
    const dropTarget = screen.getByLabelText("Change photo").closest("label");
    expect(dropTarget).not.toBeNull();
    fireEvent.drop(dropTarget as HTMLLabelElement, {
      dataTransfer: { files: [file] },
    });

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("shows fallback initials when no image is set", () => {
    render(<ImageUpload onFileSelected={vi.fn()} label="Change photo" fallbackInitials="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
