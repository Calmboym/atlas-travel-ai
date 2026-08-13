import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

describe("Checkbox", () => {
  it("toggles checked state and calls onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);

    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toHaveAttribute("aria-checked", "false");

    await user.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("is keyboard operable via Space", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);
    await user.tab();
    await user.keyboard(" ");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe("Switch", () => {
  it("toggles and reflects state via data-state / aria-checked", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Notifications" />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await user.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });
});

describe("RadioGroup", () => {
  it("allows selecting exactly one item and reports the value", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup onValueChange={onValueChange} aria-label="Travel style">
        <RadioGroupItem value="solo" aria-label="Solo" />
        <RadioGroupItem value="family" aria-label="Family" />
      </RadioGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "Solo" }));
    expect(onValueChange).toHaveBeenCalledWith("solo");
    expect(screen.getByRole("radio", { name: "Solo" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Family" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});

describe("Select", () => {
  it("opens, lists options, and selects one", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Budget">
          <SelectValue placeholder="Choose a budget" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="economy">Economy</SelectItem>
          <SelectItem value="luxury">Luxury</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole("combobox", { name: "Budget" }));
    const option = await screen.findByRole("option", { name: "Luxury" });
    await user.click(option);

    expect(onValueChange).toHaveBeenCalledWith("luxury");
  });

  it("marks the trigger invalid via aria-invalid", () => {
    render(
      <Select>
        <SelectTrigger invalid aria-label="Budget">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("Textarea", () => {
  it("renders with the given rows and forwards value changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" onChange={onChange} rows={6} />);
    const field = screen.getByRole("textbox", { name: "Notes" });
    expect(field).toHaveAttribute("rows", "6");
    await user.type(field, "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("sets aria-invalid when invalid", () => {
    render(<Textarea aria-label="Notes" invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});
