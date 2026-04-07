UI.dependencies([
    "range.css"
])

UI.register("labeled-range", `
<div class="cloud-ui-range-wrapper">
    <span class="cloud-ui-range-label">@param(text)</span>
</div>
`, {
    text: "My cool label",
    min: 0,
    max: 100,
    step: 1,
    lowerValue: 25,
    upperValue: 75,
    labelInterval: 10,
    tickInterval: 5
}, (element, params) => {
    UI.add(element, UI.component("range", params))
})

UI.register("range", `
<div class="range-container">
    <div class="range-inputs">
        <input type="range" class="range-slider range-lower" 
               min="@param(min)" max="@param(max)" step="@param(step)" 
               value="@param(lowerValue)">
        <input type="range" class="range-slider range-upper" 
               min="@param(min)" max="@param(max)" step="@param(step)" 
               value="@param(upperValue)">
    </div>
    <div class="range-labels"></div>
</div>
`, {
        min: 0,
        max: 100,
        step: 1,
        lowerValue: 25,
        upperValue: 75,
        labelInterval: 10,  // Show labels every K (e.g., 10)
        tickInterval: 5     // Show ticks every J (e.g., 5)
    },
    (element, params) => {
        const lowerInput = UI.get(".range-lower", element);
        const upperInput = UI.get(".range-upper", element);
        const labelsContainer = UI.get(".range-labels", element);
        const rangeInputs = UI.get(".range-inputs", element);

        // Update the accent fill position and width
        const updateAccentFill = () => {
            const min = parseFloat(params.min);
            const max = parseFloat(params.max);
            const range = max - min;

            const lowerVal = parseFloat(lowerInput.value);
            const upperVal = parseFloat(upperInput.value);

            const lowerPercent = ((lowerVal - min) / range) * 100;
            const upperPercent = ((upperVal - min) / range) * 100;

            rangeInputs.style.setProperty("--lower-percent", lowerPercent + "%");
            rangeInputs.style.setProperty("--upper-percent", upperPercent + "%");
        };

        // Generate labels and tick marks
        const generateLabelsAndTicks = () => {
            labelsContainer.innerHTML = "";
            const min = parseFloat(params.min);
            const max = parseFloat(params.max);
            const labelInterval = parseFloat(params.labelInterval);
            const tickInterval = parseFloat(params.tickInterval);
            const range = max - min;

            const markedPositions = new Set();

            // First pass: add all labeled positions
            for (let i = min; i <= max; i += labelInterval) {
                const position = ((i - min) / range) * 100;
                const tick = UI.element("div", {class: "range-tick range-label-tick"});
                tick.style.left = position + "%";

                const label = UI.element("div", {class: "range-label"}, {textContent: Math.round(i)});
                tick.appendChild(label);

                labelsContainer.appendChild(tick);
                markedPositions.add(position);
            }

            // Second pass: add ticks that haven't been labeled yet
            for (let i = min; i <= max; i += tickInterval) {
                const position = ((i - min) / range) * 100;

                // Only add if not already labeled
                if (!markedPositions.has(position)) {
                    const tick = UI.element("div", {class: "range-tick"});
                    tick.style.left = position + "%";
                    labelsContainer.appendChild(tick);
                    markedPositions.add(position);
                }
            }
        };

        generateLabelsAndTicks();
        updateAccentFill();

        // Store references for external access
        element.getLowerValue = () => parseFloat(lowerInput.value);
        element.getUpperValue = () => parseFloat(upperInput.value);
        element.setLowerValue = (val) => {
            lowerInput.value = Math.max(params.min, Math.min(val, parseFloat(upperInput.value)));
            updateAccentFill();
        };
        element.setUpperValue = (val) => {
            upperInput.value = Math.max(parseFloat(lowerInput.value), Math.min(val, params.max));
            updateAccentFill();
        };

        // Enforce lower <= upper constraint
        const syncSliders = () => {
            if (parseFloat(lowerInput.value) > parseFloat(upperInput.value)) {
                [lowerInput.value, upperInput.value] = [upperInput.value, lowerInput.value];
            }
            updateAccentFill();
        };

        lowerInput.addEventListener("input", syncSliders);
        upperInput.addEventListener("input", syncSliders);

        // Dispatch custom event when range changes
        const dispatchChangeEvent = () => {
            element.dispatchEvent(new CustomEvent("rangechange", {
                detail: {
                    lower: element.getLowerValue(),
                    upper: element.getUpperValue()
                }
            }));
        };

        lowerInput.addEventListener("change", dispatchChangeEvent);
        upperInput.addEventListener("change", dispatchChangeEvent);
    });