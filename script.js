class ASC606Analyzer {
    constructor() {
        this.productCounter = 1;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeContract();
        });

        document.getElementById('addProduct').addEventListener('click', () => {
            this.addProductRow();
        });

        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearForm();
        });
        
        // Add listener for initial product type change
        document.getElementById('productType0').addEventListener('change', (e) => {
            this.toggleSSPSection(0, e.target.value);
        });
    }
    
    toggleSSPSection(index, productType) {
        const sspSection = document.getElementById(`sspSection${index}`);
        if (sspSection) {
            if (productType === 'software-license') {
                sspSection.style.display = 'block';
            } else {
                sspSection.style.display = 'none';
                // Clear SSP values when hiding
                const licenseInput = document.getElementById(`licenseAllocation${index}`);
                const supportInput = document.getElementById(`supportAllocation${index}`);
                const otherInput = document.getElementById(`otherAllocation${index}`);
                const otherDescInput = document.getElementById(`otherDescription${index}`);
                
                if (licenseInput) licenseInput.value = '';
                if (supportInput) supportInput.value = '';
                if (otherInput) otherInput.value = '';
                if (otherDescInput) otherDescInput.value = '';
            }
        }
    }

    addProductRow() {
        const container = document.getElementById('productsContainer');
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="productName${this.productCounter}">Product/Service Name:</label>
                    <input type="text" id="productName${this.productCounter}" name="products[${this.productCounter}][name]" required>
                </div>
                <div class="form-group">
                    <label for="productType${this.productCounter}">Type:</label>
                    <select id="productType${this.productCounter}" name="products[${this.productCounter}][type]" required>
                        <option value="">Select type</option>
                        <option value="software-license">Software License</option>
                        <option value="saas">SaaS/Subscription</option>
                        <option value="support">Support Services</option>
                        <option value="professional-services">Professional Services</option>
                        <option value="training">Training</option>
                        <option value="hardware">Hardware</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="quantity${this.productCounter}">Quantity:</label>
                    <input type="number" id="quantity${this.productCounter}" name="products[${this.productCounter}][quantity]" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="unit${this.productCounter}">Unit:</label>
                    <input type="text" id="unit${this.productCounter}" name="products[${this.productCounter}][unit]" placeholder="e.g., users, hours, licenses">
                </div>
                <div class="form-group">
                    <label for="listPrice${this.productCounter}">List Price (per pricing basis above):</label>
                    <input type="number" id="listPrice${this.productCounter}" name="products[${this.productCounter}][listPrice]" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="salesPrice${this.productCounter}">Sales Price (per pricing basis above):</label>
                    <input type="number" id="salesPrice${this.productCounter}" name="products[${this.productCounter}][salesPrice]" step="0.01" required>
                </div>
            </div>
            <div class="form-group">
                <label for="description${this.productCounter}">Description/Terms:</label>
                <textarea id="description${this.productCounter}" name="products[${this.productCounter}][description]" rows="2" placeholder="Additional terms, conditions, or description"></textarea>
            </div>
            
            <!-- SSP Allocation Section -->
            <div class="ssp-allocation" id="sspSection${this.productCounter}" style="display: none;">
                <h4>SSP Allocation (Software License Only)</h4>
                <p class="ssp-help">Allocate this software license price between license and support components (e.g., 85% license, 15% support)</p>
                <div class="allocation-row">
                    <div class="form-group">
                        <label for="licenseAllocation${this.productCounter}">License Allocation (%):</label>
                        <input type="number" id="licenseAllocation${this.productCounter}" name="products[${this.productCounter}][licenseAllocation]" min="0" max="100" step="1" placeholder="85">
                    </div>
                    <div class="form-group">
                        <label for="supportAllocation${this.productCounter}">Support Allocation (%):</label>
                        <input type="number" id="supportAllocation${this.productCounter}" name="products[${this.productCounter}][supportAllocation]" min="0" max="100" step="1" placeholder="15">
                    </div>
                </div>
                <div class="allocation-row">
                    <div class="form-group">
                        <label for="otherAllocation${this.productCounter}">Other Allocation (%):</label>
                        <input type="number" id="otherAllocation${this.productCounter}" name="products[${this.productCounter}][otherAllocation]" min="0" max="100" step="1" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label for="otherDescription${this.productCounter}">Other Description:</label>
                        <input type="text" id="otherDescription${this.productCounter}" name="products[${this.productCounter}][otherDescription]" placeholder="e.g., Training, Implementation">
                    </div>
                </div>
                <div class="allocation-total" id="allocationTotal${this.productCounter}">
                    <small>Total allocation: <span class="total-percent">0%</span></small>
                </div>
            </div>
            <button type="button" class="remove-product btn-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(productItem);
        
        // Add event listener for the new product type selector
        document.getElementById(`productType${this.productCounter}`).addEventListener('change', (e) => {
            this.toggleSSPSection(this.productCounter, e.target.value);
        });
        
        this.productCounter++;
    }

    clearForm() {
        document.getElementById('orderForm').reset();
        document.getElementById('results').style.display = 'none';
        // Reset to single product row
        const container = document.getElementById('productsContainer');
        const products = container.querySelectorAll('.product-item');
        for (let i = 1; i < products.length; i++) {
            products[i].remove();
        }
        this.productCounter = 1;
    }

    analyzeContract() {
        const formData = new FormData(document.getElementById('orderForm'));
        const contractData = this.parseFormData(formData);
        const analysis = this.performASC606Analysis(contractData);
        this.displayResults(analysis);
    }

    parseFormData(formData) {
        const data = {
            customer: formData.get('customerName'),
            contractStart: formData.get('contractStart'),
            contractEnd: formData.get('contractEnd'),
            contractLength: parseFloat(formData.get('contractLength')),
            paymentTerms: formData.get('paymentTerms'),
            billingFrequency: formData.get('billingFrequency'),
            pricingBasis: formData.get('pricingBasis'), // 'annual' or 'total'
            termsText: formData.get('termsText'),
            features: formData.getAll('features'),
            products: []
        };

        // Parse products
        let productIndex = 0;
        while (formData.get(`products[${productIndex}][name]`)) {
            const listPrice = parseFloat(formData.get(`products[${productIndex}][listPrice]`));
            const salesPrice = parseFloat(formData.get(`products[${productIndex}][salesPrice]`));
            const quantity = parseFloat(formData.get(`products[${productIndex}][quantity]`));
            
            // Calculate annual and total values based on pricing basis
            let annualListPrice, annualSalesPrice, totalListPrice, totalSalesPrice;
            
            if (data.pricingBasis === 'annual') {
                annualListPrice = listPrice;
                annualSalesPrice = salesPrice;
                totalListPrice = listPrice * data.contractLength;
                totalSalesPrice = salesPrice * data.contractLength;
            } else {
                totalListPrice = listPrice;
                totalSalesPrice = salesPrice;
                annualListPrice = listPrice / data.contractLength;
                annualSalesPrice = salesPrice / data.contractLength;
            }
            
            const product = {
                name: formData.get(`products[${productIndex}][name]`),
                type: formData.get(`products[${productIndex}][type]`),
                quantity: quantity,
                unit: formData.get(`products[${productIndex}][unit]`),
                listPrice: listPrice, // As entered
                salesPrice: salesPrice, // As entered
                annualListPrice: annualListPrice,
                annualSalesPrice: annualSalesPrice,
                totalListPrice: totalListPrice,
                totalSalesPrice: totalSalesPrice,
                description: formData.get(`products[${productIndex}][description]`),
                // SSP Allocation data
                licenseAllocation: parseFloat(formData.get(`products[${productIndex}][licenseAllocation]`)) || 0,
                supportAllocation: parseFloat(formData.get(`products[${productIndex}][supportAllocation]`)) || 0,
                otherAllocation: parseFloat(formData.get(`products[${productIndex}][otherAllocation]`)) || 0,
                otherDescription: formData.get(`products[${productIndex}][otherDescription]`) || ''
            };
            
            // Use total contract value for calculations
            product.totalValue = product.quantity * product.totalSalesPrice;
            product.annualValue = product.quantity * product.annualSalesPrice;
            
            // Calculate allocated amounts if SSP allocation is provided (based on total contract value)
            if (product.licenseAllocation > 0 || product.supportAllocation > 0 || product.otherAllocation > 0) {
                product.allocatedComponents = {
                    license: {
                        percentage: product.licenseAllocation,
                        amount: (product.totalValue * product.licenseAllocation / 100),
                        annualAmount: (product.annualValue * product.licenseAllocation / 100)
                    },
                    support: {
                        percentage: product.supportAllocation,
                        amount: (product.totalValue * product.supportAllocation / 100),
                        annualAmount: (product.annualValue * product.supportAllocation / 100)
                    },
                    other: {
                        percentage: product.otherAllocation,
                        amount: (product.totalValue * product.otherAllocation / 100),
                        annualAmount: (product.annualValue * product.otherAllocation / 100),
                        description: product.otherDescription
                    }
                };
            }
            
            data.products.push(product);
            productIndex++;
        }

        return data;
    }

    performASC606Analysis(data) {
        const analysis = {
            contractOverview: this.generateContractOverview(data),
            step1: this.analyzeContractIdentification(data),
            step2: this.identifyPerformanceObligations(data),
            step3: this.determineTransactionPrice(data),
            step4: this.allocateTransactionPrice(data),
            step5: this.determineRevenueRecognition(data),
            recommendations: this.generateRecommendations(data),
            riskFactors: this.identifyRiskFactors(data)
        };

        return analysis;
    }

    generateContractOverview(data) {
        const totalValue = data.products.reduce((sum, product) => sum + product.totalValue, 0);
        const annualValue = data.products.reduce((sum, product) => sum + product.annualValue, 0);
        const contractDuration = this.calculateContractDuration(data.contractStart, data.contractEnd);
        
        return {
            customer: data.customer,
            totalValue: totalValue,
            annualValue: annualValue,
            pricingBasis: data.pricingBasis,
            duration: contractDuration,
            startDate: data.contractStart,
            endDate: data.contractEnd,
            paymentTerms: data.paymentTerms,
            billingFrequency: data.billingFrequency,
            productCount: data.products.length
        };
    }

    analyzeContractIdentification(data) {
        const hasCommercialSubstance = data.products.length > 0 && data.products.some(p => p.totalValue > 0);
        const hasApproval = true; // Assume approval exists if form is filled
        const hasEnforceableRights = data.termsText.length > 0;
        
        return {
            validContract: hasCommercialSubstance && hasApproval && hasEnforceableRights,
            commercialSubstance: hasCommercialSubstance,
            approval: hasApproval,
            enforceableRights: hasEnforceableRights,
            assessment: hasCommercialSubstance && hasApproval && hasEnforceableRights ? 
                'Valid contract identified' : 'Contract validity concerns identified'
        };
    }

    identifyPerformanceObligations(data) {
        const obligations = [];
        const bundledServices = [];
        
        data.products.forEach(product => {
            // For software licenses with SSP allocation, treat as single product with mixed recognition
            if (product.type === 'software-license' && product.allocatedComponents) {
                obligations.push({
                    name: product.name,
                    type: 'software-license',
                    distinct: true,
                    deliveryPattern: 'mixed', // Mixed recognition pattern
                    value: product.totalValue,
                    sspAllocation: {
                        license: {
                            percentage: product.allocatedComponents.license.percentage,
                            amount: product.allocatedComponents.license.amount,
                            pattern: 'point-in-time'
                        },
                        support: {
                            percentage: product.allocatedComponents.support.percentage,
                            amount: product.allocatedComponents.support.amount,
                            pattern: 'over-time'
                        },
                        other: product.allocatedComponents.other.amount > 0 ? {
                            percentage: product.allocatedComponents.other.percentage,
                            amount: product.allocatedComponents.other.amount,
                            description: product.allocatedComponents.other.description,
                            pattern: 'point-in-time' // Default for other components
                        } : null
                    }
                });
            } else if (product.allocatedComponents) {
                // Non-software license products with SSP allocation (shouldn't happen now, but keeping for safety)
                if (product.allocatedComponents.license.amount > 0) {
                    obligations.push({
                        name: `${product.name} - License`,
                        type: 'software-license',
                        distinct: true,
                        deliveryPattern: 'point-in-time',
                        value: product.allocatedComponents.license.amount,
                        percentage: product.allocatedComponents.license.percentage,
                        parentProduct: product.name
                    });
                }
                
                if (product.allocatedComponents.support.amount > 0) {
                    obligations.push({
                        name: `${product.name} - Support`,
                        type: 'support',
                        distinct: true,
                        deliveryPattern: 'over-time',
                        value: product.allocatedComponents.support.amount,
                        percentage: product.allocatedComponents.support.percentage,
                        parentProduct: product.name
                    });
                }
                
                if (product.allocatedComponents.other.amount > 0) {
                    obligations.push({
                        name: `${product.name} - ${product.allocatedComponents.other.description}`,
                        type: 'other',
                        distinct: true,
                        deliveryPattern: this.determineDeliveryPattern({type: 'other', description: product.allocatedComponents.other.description}),
                        value: product.allocatedComponents.other.amount,
                        percentage: product.allocatedComponents.other.percentage,
                        parentProduct: product.name
                    });
                }
            } else {
                // Standard product without SSP allocation
                const obligation = {
                    name: product.name,
                    type: product.type,
                    distinct: this.assessDistinctness(product, data.products),
                    deliveryPattern: this.determineDeliveryPattern(product),
                    value: product.totalValue
                };
                
                if (obligation.distinct) {
                    obligations.push(obligation);
                } else {
                    bundledServices.push(obligation);
                }
            }
        });

        return {
            distinctObligations: obligations,
            bundledServices: bundledServices,
            totalObligations: obligations.length + (bundledServices.length > 0 ? 1 : 0),
            assessment: this.assessPerformanceObligations(obligations, bundledServices)
        };
    }

    assessDistinctness(product, allProducts) {
        // Simplified logic for distinctness
        if (product.type === 'hardware') return true;
        if (product.type === 'professional-services' && product.description.toLowerCase().includes('implementation')) return false;
        if (product.type === 'support' && allProducts.some(p => p.type === 'software-license' || p.type === 'saas')) return false;
        return true;
    }

    determineDeliveryPattern(product) {
        switch (product.type) {
            case 'hardware':
                return 'point-in-time';
            case 'software-license':
                // Software licenses are recognized at point-in-time upon delivery of the license key
                // Performance obligation is satisfied upon delivery of the license key
                return 'point-in-time';
            case 'saas':
            case 'support':
                return 'over-time';
            case 'professional-services':
                return product.description.toLowerCase().includes('ongoing') ? 'over-time' : 'point-in-time';
            case 'training':
                return 'point-in-time';
            default:
                return 'over-time';
        }
    }

    determineTransactionPrice(data) {
        const totalValue = data.products.reduce((sum, product) => sum + product.totalValue, 0);
        const hasVariableConsideration = data.features.includes('variable-consideration') || 
                                       data.features.includes('usage-based') ||
                                       data.termsText.toLowerCase().includes('variable') ||
                                       data.termsText.toLowerCase().includes('usage');
        
        const constraintRequired = hasVariableConsideration;
        
        return {
            fixedAmount: totalValue,
            variableConsideration: hasVariableConsideration,
            constraintRequired: constraintRequired,
            estimationMethod: hasVariableConsideration ? 'expected-value' : 'none',
            assessment: `Transaction price: $${totalValue.toLocaleString()}${hasVariableConsideration ? ' (plus variable consideration)' : ''}`
        };
    }

    allocateTransactionPrice(data) {
        const totalValue = data.products.reduce((sum, product) => sum + product.totalValue, 0);
        const allocations = [];
        
        data.products.forEach(product => {
            if (product.type === 'software-license' && product.allocatedComponents) {
                // Software license with SSP allocation - show as components
                if (product.allocatedComponents.license.amount > 0) {
                    allocations.push({
                        obligation: `${product.name} - License Component`,
                        allocatedAmount: product.allocatedComponents.license.amount,
                        percentage: ((product.allocatedComponents.license.amount / totalValue) * 100).toFixed(1),
                        method: 'SSP-allocation',
                        sspPercentage: product.allocatedComponents.license.percentage
                    });
                }
                
                if (product.allocatedComponents.support.amount > 0) {
                    allocations.push({
                        obligation: `${product.name} - Support Component`,
                        allocatedAmount: product.allocatedComponents.support.amount,
                        percentage: ((product.allocatedComponents.support.amount / totalValue) * 100).toFixed(1),
                        method: 'SSP-allocation',
                        sspPercentage: product.allocatedComponents.support.percentage
                    });
                }
                
                if (product.allocatedComponents.other.amount > 0) {
                    allocations.push({
                        obligation: `${product.name} - ${product.allocatedComponents.other.description}`,
                        allocatedAmount: product.allocatedComponents.other.amount,
                        percentage: ((product.allocatedComponents.other.amount / totalValue) * 100).toFixed(1),
                        method: 'SSP-allocation',
                        sspPercentage: product.allocatedComponents.other.percentage
                    });
                }
            } else if (product.allocatedComponents) {
                // Other products with SSP allocation (legacy support)
                if (product.allocatedComponents.license.amount > 0) {
                    allocations.push({
                        obligation: `${product.name} - License`,
                        allocatedAmount: product.allocatedComponents.license.amount,
                        percentage: ((product.allocatedComponents.license.amount / totalValue) * 100).toFixed(1),
                        method: 'SSP-allocation',
                        sspPercentage: product.allocatedComponents.license.percentage
                    });
                }
                
                if (product.allocatedComponents.support.amount > 0) {
                    allocations.push({
                        obligation: `${product.name} - Support`,
                        allocatedAmount: product.allocatedComponents.support.amount,
                        percentage: ((product.allocatedComponents.support.amount / totalValue) * 100).toFixed(1),
                        method: 'SSP-allocation',
                        sspPercentage: product.allocatedComponents.support.percentage
                    });
                }
                
                if (product.allocatedComponents.other.amount > 0) {
                    allocations.push({
                        obligation: `${product.name} - ${product.allocatedComponents.other.description}`,
                        allocatedAmount: product.allocatedComponents.other.amount,
                        percentage: ((product.allocatedComponents.other.amount / totalValue) * 100).toFixed(1),
                        method: 'SSP-allocation',
                        sspPercentage: product.allocatedComponents.other.percentage
                    });
                }
            } else {
                // Standard product allocation
                allocations.push({
                    obligation: product.name,
                    allocatedAmount: product.totalValue,
                    percentage: (product.totalValue / totalValue * 100).toFixed(1),
                    method: 'contract-price'
                });
            }
        });
        
        const hasSSPAllocations = allocations.some(a => a.method === 'SSP-allocation');
        
        return {
            method: hasSSPAllocations ? 'SSP-allocation' : 'contract-price',
            allocations: allocations,
            totalAllocated: totalValue,
            assessment: hasSSPAllocations ? 
                'Transaction price allocated using Standalone Selling Price (SSP) method for bundled products' :
                'Transaction price allocated based on contract pricing'
        };
    }

    determineRevenueRecognition(data) {
        const recognitionPatterns = [];
        const contractDuration = {
            years: data.contractLength,
            months: data.contractLength * 12
        };
        
        data.products.forEach(product => {
            // Handle software licenses with SSP allocation specially
            if (product.type === 'software-license' && product.allocatedComponents) {
                // License component - point-in-time recognition
                if (product.allocatedComponents.license.amount > 0) {
                    recognitionPatterns.push({
                        obligation: `${product.name} - License Component`,
                        pattern: 'point-in-time',
                        timing: 'Upon delivery of license key (contract start)',
                        monthlyAmount: 0,
                        totalAmount: product.allocatedComponents.license.amount,
                        percentage: product.allocatedComponents.license.percentage,
                        componentType: 'license'
                    });
                }
                
                // Support component - over-time recognition
                if (product.allocatedComponents.support.amount > 0) {
                    const monthlyAmount = (product.allocatedComponents.support.amount / contractDuration.months).toFixed(2);
                    recognitionPatterns.push({
                        obligation: `${product.name} - Support Component`,
                        pattern: 'over-time',
                        timing: 'Straight-line over contract term',
                        monthlyAmount: monthlyAmount,
                        totalAmount: product.allocatedComponents.support.amount,
                        percentage: product.allocatedComponents.support.percentage,
                        componentType: 'support'
                    });
                }
                
                // Other component if present
                if (product.allocatedComponents.other.amount > 0) {
                    const pattern = 'point-in-time'; // Default for other components
                    const monthlyAmount = pattern === 'over-time' ? 
                        (product.allocatedComponents.other.amount / contractDuration.months).toFixed(2) : 0;
                    
                    recognitionPatterns.push({
                        obligation: `${product.name} - ${product.allocatedComponents.other.description}`,
                        pattern: pattern,
                        timing: pattern === 'point-in-time' ? 'Upon delivery/completion' : 'Straight-line over contract term',
                        monthlyAmount: monthlyAmount,
                        totalAmount: product.allocatedComponents.other.amount,
                        percentage: product.allocatedComponents.other.percentage,
                        componentType: 'other'
                    });
                }
            } else if (product.allocatedComponents) {
                // Handle other products with SSP allocation (legacy support)
                if (product.allocatedComponents.license.amount > 0) {
                    recognitionPatterns.push({
                        obligation: `${product.name} - License`,
                        pattern: 'point-in-time',
                        timing: 'Upon delivery of license key (contract start)',
                        monthlyAmount: 0,
                        totalAmount: product.allocatedComponents.license.amount,
                        percentage: product.allocatedComponents.license.percentage
                    });
                }
                
                if (product.allocatedComponents.support.amount > 0) {
                    const monthlyAmount = (product.allocatedComponents.support.amount / contractDuration.months).toFixed(2);
                    recognitionPatterns.push({
                        obligation: `${product.name} - Support`,
                        pattern: 'over-time',
                        timing: 'Straight-line over contract term',
                        monthlyAmount: monthlyAmount,
                        totalAmount: product.allocatedComponents.support.amount,
                        percentage: product.allocatedComponents.support.percentage
                    });
                }
                
                if (product.allocatedComponents.other.amount > 0) {
                    const pattern = this.determineDeliveryPattern({type: 'other', description: product.allocatedComponents.other.description});
                    const monthlyAmount = pattern === 'over-time' ? 
                        (product.allocatedComponents.other.amount / contractDuration.months).toFixed(2) : 0;
                    
                    recognitionPatterns.push({
                        obligation: `${product.name} - ${product.allocatedComponents.other.description}`,
                        pattern: pattern,
                        timing: pattern === 'point-in-time' ? 'Upon delivery/completion' : 'Straight-line over contract term',
                        monthlyAmount: monthlyAmount,
                        totalAmount: product.allocatedComponents.other.amount,
                        percentage: product.allocatedComponents.other.percentage
                    });
                }
            } else {
                // Standard product without SSP allocation
                const pattern = this.determineDeliveryPattern(product);
                let timing;
                
                if (pattern === 'point-in-time') {
                    if (product.type === 'software-license') {
                        timing = 'Upon delivery of license key (contract start)';
                    } else if (product.type === 'hardware') {
                        timing = 'Upon delivery/acceptance';
                    } else if (product.type === 'training') {
                        timing = 'Upon completion of training';
                    } else {
                        timing = 'Upon delivery/completion';
                    }
                } else {
                    timing = 'Straight-line over contract term';
                }
                
                const monthlyAmount = pattern === 'over-time' ? 
                    (product.totalValue / contractDuration.months).toFixed(2) : 0;
                
                recognitionPatterns.push({
                    obligation: product.name,
                    pattern: pattern,
                    timing: timing,
                    monthlyAmount: monthlyAmount,
                    totalAmount: product.totalValue
                });
            }
        });
        
        return {
            patterns: recognitionPatterns,
            overallPattern: this.determineOverallPattern(recognitionPatterns),
            contractDuration: contractDuration,
            assessment: this.generateRecognitionAssessment(recognitionPatterns)
        };
    }

    generateRecommendations(data) {
        const recommendations = [];
        
        // Check for software license specific guidance
        const softwareLicenses = data.products.filter(p => p.type === 'software-license');
        if (softwareLicenses.length > 0) {
            const hasSSPAllocation = softwareLicenses.some(p => p.allocatedComponents);
            
            if (hasSSPAllocation) {
                recommendations.push({
                    type: 'info',
                    title: 'Software License SSP Allocation',
                    description: 'Software license with SSP allocation: License component recognized at point-in-time upon delivery of license key, Support component recognized ratably over contract term.'
                });
            } else {
                recommendations.push({
                    type: 'info',
                    title: 'Software License Recognition',
                    description: 'Software licenses are recognized at point-in-time upon delivery of the license key. Performance obligation is satisfied when customer gains control of the license, typically at contract start.'
                });
            }
        }
        
        // Check for common issues
        if (data.features.includes('variable-consideration')) {
            recommendations.push({
                type: 'warning',
                title: 'Variable Consideration Constraint',
                description: 'Implement constraint analysis to avoid revenue reversals. Estimate variable consideration using expected value method.'
            });
        }
        
        if (data.features.includes('cancellation-rights')) {
            recommendations.push({
                type: 'caution',
                title: 'Cancellation Rights Impact',
                description: 'Evaluate if cancellation rights affect contract enforceability and revenue recognition timing.'
            });
        }
        
        if (data.products.some(p => p.type === 'support' && p.salesPrice < p.listPrice * 0.8)) {
            recommendations.push({
                type: 'info',
                title: 'Support Services Pricing',
                description: 'Significant discount on support services may indicate bundled pricing. Consider standalone selling price analysis.'
            });
        }
        
        // Check for mixed recognition patterns
        const pointInTimeProducts = data.products.filter(p => this.determineDeliveryPattern(p) === 'point-in-time');
        const overTimeProducts = data.products.filter(p => this.determineDeliveryPattern(p) === 'over-time');
        
        if (pointInTimeProducts.length > 0 && overTimeProducts.length > 0) {
            recommendations.push({
                type: 'info',
                title: 'Mixed Recognition Patterns',
                description: `Contract contains both point-in-time (${pointInTimeProducts.length} items) and over-time (${overTimeProducts.length} items) recognition. Ensure proper timing for each performance obligation.`
            });
        }
        
        const totalDiscount = data.products.reduce((sum, p) => sum + (p.listPrice - p.salesPrice) * p.quantity, 0);
        if (totalDiscount > 0) {
            recommendations.push({
                type: 'info',
                title: 'Contract Discount Analysis',
                description: `Total discount of $${totalDiscount.toLocaleString()} should be allocated proportionally across performance obligations.`
            });
        }
        
        return recommendations;
    }

    identifyRiskFactors(data) {
        const risks = [];
        
        if (data.features.includes('performance-guarantees')) {
            risks.push('Performance guarantees may create additional obligations');
        }
        
        if (data.features.includes('refund-provisions')) {
            risks.push('Refund provisions may impact revenue recognition timing');
        }
        
        if (data.termsText.toLowerCase().includes('milestone')) {
            risks.push('Milestone-based contracts require careful performance obligation analysis');
        }
        
        const contractDuration = this.calculateContractDuration(data.contractStart, data.contractEnd);
        if (contractDuration.years > 3) {
            risks.push('Long-term contracts increase risk of contract modifications');
        }
        
        return risks;
    }

    calculateContractDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.round(diffDays / 30.44); // Average days per month
        const years = Math.round(months / 12 * 10) / 10; // Round to 1 decimal
        
        return { days: diffDays, months: months, years: years };
    }

    determineOverallPattern(patterns) {
        const overTimeCount = patterns.filter(p => p.pattern === 'over-time').length;
        const pointInTimeCount = patterns.filter(p => p.pattern === 'point-in-time').length;
        
        if (overTimeCount > pointInTimeCount) return 'Primarily over-time recognition';
        if (pointInTimeCount > overTimeCount) return 'Primarily point-in-time recognition';
        return 'Mixed recognition patterns';
    }

    generateRecognitionAssessment(patterns) {
        const overTimeRevenue = patterns
            .filter(p => p.pattern === 'over-time')
            .reduce((sum, p) => sum + p.totalAmount, 0);
        
        const pointInTimeRevenue = patterns
            .filter(p => p.pattern === 'point-in-time')
            .reduce((sum, p) => sum + p.totalAmount, 0);
        
        const licenseComponentRevenue = patterns
            .filter(p => p.componentType === 'license')
            .reduce((sum, p) => sum + p.totalAmount, 0);
            
        const supportComponentRevenue = patterns
            .filter(p => p.componentType === 'support')
            .reduce((sum, p) => sum + p.totalAmount, 0);
        
        let assessment = `Revenue recognition: $${pointInTimeRevenue.toLocaleString()} at point in time, $${overTimeRevenue.toLocaleString()} over time`;
        
        if (licenseComponentRevenue > 0 && supportComponentRevenue > 0) {
            assessment += `. SSP Allocation: License component ($${licenseComponentRevenue.toLocaleString()}) recognized upon delivery, Support component ($${supportComponentRevenue.toLocaleString()}) recognized ratably.`;
        } else if (licenseComponentRevenue > 0) {
            assessment += `. Software licenses ($${licenseComponentRevenue.toLocaleString()}) recognized upon license key delivery.`;
        }
        
        return assessment;
    }

    assessPerformanceObligations(distinct, bundled) {
        if (distinct.length === 0 && bundled.length === 0) {
            return 'No performance obligations identified';
        }
        
        let assessment = `${distinct.length} distinct performance obligation(s) identified`;
        if (bundled.length > 0) {
            assessment += `, ${bundled.length} bundled service(s) combined into single obligation`;
        }
        
        return assessment;
    }

    displayResults(analysis) {
        const resultsDiv = document.getElementById('results');
        const outputDiv = document.getElementById('analysisOutput');
        
        outputDiv.innerHTML = `
            <div class="analysis-summary">
                <h3>Contract Overview</h3>
                <div class="overview-grid">
                    <div class="overview-item">
                        <strong>Customer:</strong> ${analysis.contractOverview.customer}
                    </div>
                    <div class="overview-item">
                        <strong>Annual Value:</strong> $${analysis.contractOverview.annualValue.toLocaleString()}
                        ${analysis.contractOverview.pricingBasis === 'annual' ? '<span class="basis-note">(as entered)</span>' : '<span class="basis-note">(calculated)</span>'}
                    </div>
                    <div class="overview-item">
                        <strong>Total Contract Value:</strong> $${analysis.contractOverview.totalValue.toLocaleString()}
                        ${analysis.contractOverview.pricingBasis === 'total' ? '<span class="basis-note">(as entered)</span>' : '<span class="basis-note">(calculated)</span>'}
                    </div>
                    <div class="overview-item">
                        <strong>Duration:</strong> ${analysis.contractOverview.duration.years} years (${analysis.contractOverview.duration.months} months)
                    </div>
                    <div class="overview-item">
                        <strong>Products:</strong> ${analysis.contractOverview.productCount}
                    </div>
                    <div class="overview-item">
                        <strong>Pricing Basis:</strong> ${analysis.contractOverview.pricingBasis === 'annual' ? 'Annual Amounts' : 'Total Contract Value'}
                    </div>
                </div>
            </div>

            <div class="asc606-steps">
                <div class="step">
                    <h3>Step 1: Contract Identification</h3>
                    <div class="step-result ${analysis.step1.validContract ? 'success' : 'warning'}">
                        <strong>Result:</strong> ${analysis.step1.assessment}
                    </div>
                    <ul>
                        <li>Commercial Substance: ${analysis.step1.commercialSubstance ? '✓' : '✗'}</li>
                        <li>Approval & Commitment: ${analysis.step1.approval ? '✓' : '✗'}</li>
                        <li>Enforceable Rights: ${analysis.step1.enforceableRights ? '✓' : '✗'}</li>
                    </ul>
                </div>

                <div class="step">
                    <h3>Step 2: Performance Obligations</h3>
                    <div class="step-result">
                        <strong>Result:</strong> ${analysis.step2.assessment}
                    </div>
                    <div class="obligations-list">
                        ${analysis.step2.distinctObligations.map(obligation => `
                            <div class="obligation-item">
                                <strong>${obligation.name}</strong> (${obligation.type})
                                <br>Value: $${obligation.value.toLocaleString()}
                                <br>Pattern: ${obligation.deliveryPattern}
                            </div>
                        `).join('')}
                        ${analysis.step2.bundledServices.length > 0 ? `
                            <div class="obligation-item bundled">
                                <strong>Bundled Services:</strong>
                                ${analysis.step2.bundledServices.map(s => s.name).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="step">
                    <h3>Step 3: Transaction Price</h3>
                    <div class="step-result">
                        <strong>Result:</strong> ${analysis.step3.assessment}
                    </div>
                    <ul>
                        <li>Fixed Amount: $${analysis.step3.fixedAmount.toLocaleString()}</li>
                        <li>Variable Consideration: ${analysis.step3.variableConsideration ? 'Yes' : 'No'}</li>
                        ${analysis.step3.variableConsideration ? `<li>Constraint Required: ${analysis.step3.constraintRequired ? 'Yes' : 'No'}</li>` : ''}
                    </ul>
                </div>

                <div class="step">
                    <h3>Step 4: Price Allocation</h3>
                    <div class="step-result">
                        <strong>Result:</strong> ${analysis.step4.assessment}
                    </div>
                    <div class="allocation-table">
                        ${analysis.step4.allocations.map(allocation => `
                            <div class="allocation-table-row">
                                <span class="obligation-name">${allocation.obligation}</span>
                                <span class="allocation-amount">$${allocation.allocatedAmount.toLocaleString()}</span>
                                <span class="allocation-percentage">(${allocation.percentage}%)</span>
                                ${allocation.sspPercentage ? `<span class="ssp-info">SSP: ${allocation.sspPercentage}%</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="step">
                    <h3>Step 5: Revenue Recognition</h3>
                    <div class="step-result">
                        <strong>Result:</strong> ${analysis.step5.assessment}
                    </div>
                    <div class="recognition-patterns">
                        ${analysis.step5.patterns.map(pattern => `
                            <div class="pattern-item">
                                <strong>${pattern.obligation}</strong>
                                ${pattern.percentage ? `<span class="ssp-badge">SSP: ${pattern.percentage}%</span>` : ''}
                                <br>Pattern: ${pattern.pattern}
                                <br>Timing: ${pattern.timing}
                                ${pattern.monthlyAmount > 0 ? `<br>Monthly: $${parseFloat(pattern.monthlyAmount).toLocaleString()}` : ''}
                                <br>Total: $${pattern.totalAmount.toLocaleString()}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            ${analysis.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h3>Recommendations</h3>
                    ${analysis.recommendations.map(rec => `
                        <div class="recommendation ${rec.type}">
                            <strong>${rec.title}</strong>
                            <p>${rec.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${analysis.riskFactors.length > 0 ? `
                <div class="risk-factors">
                    <h3>Risk Factors</h3>
                    <ul>
                        ${analysis.riskFactors.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ASC606Analyzer();
});