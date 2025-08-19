# ASC 606 Revenue Recognition Analyzer

A web application that analyzes order forms and contracts to provide ASC 606 revenue recognition guidance.

## Features

### Contract Analysis
- **Contract Information**: Customer details, dates, payment terms, billing frequency
- **Product & Services Input**: Multiple products with pricing, quantities, and service types
- **Terms & Conditions**: Full contract terms analysis with key feature identification

### ASC 606 Five-Step Analysis

1. **Contract Identification**
   - Commercial substance validation
   - Approval and commitment verification
   - Enforceable rights assessment

2. **Performance Obligations**
   - Distinct vs. bundled service identification
   - Delivery pattern determination
   - Service interdependency analysis

3. **Transaction Price**
   - Fixed consideration calculation
   - Variable consideration identification
   - Constraint requirement assessment

4. **Price Allocation**
   - Standalone selling price allocation
   - Proportional discount distribution
   - Contract-based pricing analysis

5. **Revenue Recognition**
   - Point-in-time vs. over-time determination
   - Monthly recognition calculations
   - Pattern-based timing recommendations

### Additional Features

- **Risk Factor Identification**: Automatic detection of contract risks
- **Recommendations**: Actionable guidance for compliance
- **Responsive Design**: Works on desktop and mobile devices
- **Dynamic Form**: Add/remove products as needed

## Usage

1. Open `index.html` in a web browser
2. Fill in contract information:
   - Customer name and contract dates
   - Payment terms and billing frequency
3. Add products and services:
   - Product name, type, and pricing
   - Quantities and units
   - Service descriptions
4. Enter terms and conditions:
   - Paste full contract terms
   - Select applicable contract features
5. Click "Analyze ASC 606 Compliance"
6. Review the detailed analysis results

## Sample Data

The application works well with complex contracts including:
- Software licenses (perpetual and subscription)
- SaaS platforms
- Support and maintenance services
- Professional services
- Training and implementation
- Hardware components

## Technical Implementation

### Files
- `index.html`: Main application interface
- `script.js`: ASC 606 analysis logic and form handling
- `styles.css`: Responsive styling and layout
- `README.md`: Documentation

### Key Classes
- `ASC606Analyzer`: Main application class
- Analysis methods for each ASC 606 step
- Dynamic form management
- Results rendering and display

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox layouts

## ASC 606 Compliance Notes

This tool provides guidance based on ASC 606 principles but should not replace professional accounting advice. Key considerations:

- **Professional Review**: Always have complex contracts reviewed by qualified accountants
- **Industry Specifics**: Some industries have specific ASC 606 interpretations
- **Ongoing Updates**: Revenue recognition standards may evolve
- **Documentation**: Maintain detailed documentation of recognition decisions

## Example Analysis

For a typical SaaS contract with support services:

```
Contract: $100,000 annual SaaS + $20,000 support
Duration: 3 years
Result: 
- Single performance obligation (bundled)
- Over-time recognition
- Monthly recognition: $10,000
- Straight-line pattern recommended
```

## Contributing

To enhance the analyzer:
1. Fork the repository
2. Add new analysis features
3. Improve the user interface
4. Add industry-specific templates
5. Submit pull requests

## License

Open source - feel free to use and modify for your organization's needs.
