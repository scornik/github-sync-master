import { describe, expect, it } from "vitest";
import { couponDiscount, deliveryFee, isValidBDPhone } from "./checkout";

describe("checkout rules", () => {
  it("charges 70 inside Dhaka", () => expect(deliveryFee("Dhaka", 1000)).toBe(70));
  it("charges 130 outside Dhaka", () => expect(deliveryFee("Sylhet", 1000)).toBe(130));
  it("free delivery from 5000", () => expect(deliveryFee("Sylhet", 5000)).toBe(0));
  it("PETAL10 gives 10%", () => expect(couponDiscount("petal10", 2000)).toBe(200));
  it("EID500 needs 3000 minimum", () => {
    expect(couponDiscount("EID500", 2999)).toBe(0);
    expect(couponDiscount("EID500", 3000)).toBe(500);
  });
  it("validates BD mobile numbers", () => {
    expect(isValidBDPhone("01712345678")).toBe(true);
    expect(isValidBDPhone("01212345678")).toBe(false);
  });
});
