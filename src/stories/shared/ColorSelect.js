export function createColorSelect() {
  return `<div class="colors">
    <p>"Select a color" option (null value) will force the facet to consume the default color again.</p>
    <label for="color_select">Select a Color</label>
    <select id="color_select">
      <option value="">Select a color</option>
      <option value="SW-6780">Nautilus (SW-6780)</option>
      <option value="SW-6342">Spice Hue (SW-6342)</option>
      <option value="SW-6903">Cheerful (SW-6903)</option>
      <option value="SW-6230">Rainstorm (SW-6230)</option>
    </select>
  </div>`
}
