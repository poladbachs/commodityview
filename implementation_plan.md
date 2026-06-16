# Implementation Plan - Marketing Conversion and Layer 2 UI Fixes

This plan outlines the steps to clean up [index.html](file:///Users/polad/commodityview/index.html) so it serves purely as a marketing landing page and waitlist conversion tool, removing the mock application views (which will be fully implemented in Next.js/Convex) and fixing compliance layout and mobile usability issues.

## User Review Required

> [!IMPORTANT]
> - **Removal of Prototype App Screens**: We are removing the mock app screens (`/deals`, `/inbox`, `/settings`, `/deals/new`) from [index.html](file:///Users/polad/commodityview/index.html). The actual application screens are being built inside the Next.js/Convex framework as outlined in `build-plan.md`. This leaves `index.html` strictly as a clean, high-converting marketing landing page.
> - **Self-Serve Waitlist Form**: Instead of generic sales qualification fields (Phone, Job Title, implementation timeline), we are using a simplified, lower-friction waitlist form tailored for a self-serve platform (capturing Name, Email, Company, Business Type, Target Layer, and optional bottleneck description).

---

## Proposed Changes

### Marketing Landing Page Component

#### [MODIFY] [index.html](file:///Users/polad/commodityview/index.html)

- **Style Sheet Updates**:
  - Add new CSS classes `.layer-grid`, `.layer-grid-left`, and `.layer-grid-right` to support side-by-side two-column grids on desktop and clean stacked sections on mobile.
  - Implement mobile media query overrides to remove right borders and switch to bottom borders when columns stack on screens below `800px`.
  - Add `[style*="1.1fr 0.9fr"]` to the selector lists in the `@media (max-width: 800px)` query block to ensure all landing page grids stack responsively on mobile.

- **Layer 2 (Compliance) UI Layout Improvements**:
  - Change the outer layout from stacked (`gridTemplateColumns: "1fr"`) to the standard responsive two-column grid (`className="layer-grid"`).
  - Move the GAFTA Spec Parameter list to the left column (`.layer-grid-left`).
  - Move the Cross-Document Reconciliation section to the right column (`.layer-grid-right`).
  - **Reconciliation Table Correction**: Fix the row mapping to render all 5 data columns (FIELD, CONTRACT, LC, BL, and VERDICT) instead of skipping the BL column values. Provide a responsive layout: 5 columns on desktop and a stacked, clean 3-part card list on mobile.

- **Mobile UX Navigation Smooth Scroll**:
  - Assign `id="active-layer-interactive"` to the layer preview container card.
  - Update the `onClick` handler of the Layer 1, Layer 2, and Layer 3 buttons: when clicked on mobile (`window.innerWidth <= 800`), it triggers a smooth scroll to `#active-layer-interactive`.

- **Waitlist Page & Form Addition**:
  - Create a new React component `WaitlistPage` rendering a highly polished registration form.
  - Fields included: First Name, Last Name, Work Email, Company Name, Business Type (select dropdown), Target Layer (select dropdown), and Workflow Bottleneck (optional textarea).
  - Style the form fields utilizing JetBrains Mono for labels and inputs, with focus rings matching the custom `--signal-amber` token.
  - Include a custom success state page to confirm registration without requiring a page redirect.

- **Clean Up and Removal of Demo & Prototype Pages**:
  - Delete `DemoPage`, `DealsListPage`, `NewDealPage`, `InboxScreen`, `SettingsScreen`, `DealDetailL1`, `DealDetailL2`, `DealDetailL3`, and `DealDetailPage` React components.
  - Simplify the router rendering logic inside the main `App` component to only check `/home`, `/products`, `/pricing`, and `/waitlist` paths.
  - Modify `MarketingNav` actions: remove "SIGN IN", change "TRY NOW" to "Join Waitlist" pointing to `/waitlist`.
  - Update pricing table buttons and footer CTAs to route directly to `/waitlist` (and pre-select relevant plans where applicable).
  - Remove all deleted routes from the debug "tweaks" panel.

---

## Verification Plan

### Manual Verification
- Deploy/run the page locally and verify:
  - **Layer 2 Grid Layout**: Confirm that Spec parameters and Cross-Doc Reconciliation render side-by-side on desktop, and cleanly stack on mobile.
  - **Reconciliation Data**: Confirm that BL values are displayed alongside Contract and LC columns.
  - **Mobile Scroll**: Simulate a mobile screen width (`<800px`), click on the Layer buttons (Layer 1, Layer 2, Layer 3), and confirm the page smoothly scrolls down to the interactive card.
  - **Waitlist Redirection**: Check that all CTAs ("Join Waitlist", Hero buttons, pricing buttons) successfully route to `/waitlist`.
  - **Form Validation & Submit**: Fill out the waitlist form, verify required field highlights, and test submission to ensure the confirmation message is displayed.
  - **Dead Links**: Confirm that clicking any link does not route to `/demo` or any broken app routes.
