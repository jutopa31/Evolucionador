# AI Integration Style Guide

This document provides guidelines for the visual presentation and user experience of the AI functionality toggle and related UI elements in the medical notes application.

## Toggle Switch

### Design Principles
- **Simplicity**: The toggle should be simple and intuitive
- **Visibility**: Clear visual indication of the current state (on/off)
- **Consistency**: Match the existing application's design language
- **Feedback**: Provide visual feedback when toggled

### Visual Specifications

#### Toggle Container
- Background: Light gray (#f8f9fa)
- Border: 1px solid border color (var(--border-color))
- Border Radius: Same as other elements (var(--border-radius))
- Padding: 8px 12px
- Margin: 0 0 15px 0
- Display: Flex with centered alignment

#### Toggle Switch
- Width: 50px
- Height: 24px
- Border Radius: 24px (fully rounded)
- Off State Background: #ccc (gray)
- On State Background: var(--secondary-color) (blue)
- Transition: 0.4s for smooth state change

#### Toggle Slider (Thumb)
- Size: 18px diameter
- Color: White
- Border Radius: 50% (circle)
- Position: 3px from edge
- Transition: 0.4s for smooth movement
- On State: Moves 26px to the right
- Animation: Subtle pulse effect when active

#### Toggle Label
- Font Size: 0.95em
- Font Weight: 500
- Color: var(--text-color)
- Margin Left: 10px

### Interaction States
- **Hover**: Slight opacity change to indicate interactivity
- **Focus**: Light glow around the toggle (box-shadow)
- **Active**: Pulse animation on the slider thumb

## AI Section Styling

### When Disabled
- Hidden from view (display: none)

### When Enabled
- Smooth transition into view
- Positioned directly after the patient data section
- Consistent with other section styling

### AI Output Area
- Background: Slightly different shade (#f8fcff)
- Border: 1px solid light blue (#e3f2fd)
- Border Radius: Same as other elements
- Padding: 12px 15px
- Min Height: 60px

## Animation Guidelines

### Toggle Animation
- Use CSS transitions for smooth state changes
- Transition duration: 0.4s
- Transition timing: ease

### Pulse Animation
\`\`\`css
@keyframes ai-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}
\`\`\`

## Responsive Behavior
- Toggle container should maintain its appearance across screen sizes
- On very small screens, consider stacking the toggle label below the switch

## Accessibility Considerations
- Ensure toggle is keyboard accessible
- Provide appropriate ARIA attributes
- Maintain color contrast ratios for visibility
- Include focus states for keyboard navigation

## Implementation Notes
- Use a hidden checkbox for the toggle state
- Style the visible toggle using the checkbox's checked state
- Ensure the toggle state persists across sessions using localStorage
- Add appropriate event listeners to handle state changes
