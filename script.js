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
                    <label for="listPrice${this.productCounter}">List Price:</label>
                    <input type="number" id="listPrice${this.productCounter}" name="products[${this.productCounter}][listPrice]" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="salesPrice${this.productCounter}">Sales Price:</label>
                    <input type="number" id="salesPrice${this.productCounter}" name="products[${this.productCounter}][salesPrice]" step="0.01" required>
                </div>
            </div>
            <div class="form-group">
                <label for="description${this.productCounter}">Description/Terms:</label>
                <textarea id="description${this.productCounter}" name="products[${this.productCounter}][description]" rows="2" placeholder="Additional terms, conditions, or description"></textarea>
            </div>
            <button type="button" class="remove-product btn-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(productItem);
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
            paymentTerms: formData.get('paymentTerms'),
            billingFrequency: formData.get('billingFrequency'),
            termsText: formData.get('termsText'),
            features: formData.getAll('features'),
            products: []
        };

        // Parse products
        let productIndex = 0;
        while (formData.get(`products[${productIndex}][name]`)) {
            const product = {
                name: formData.get(`products[${productIndex}][name]`),
                type: formData.get(`products[${productIndex}][type]`),
                quantity: parseFloat(formData.get(`products[${productIndex}][quantity]`)),
                unit: formData.get(`products[${productIndex}][unit]`),
                listPrice: parseFloat(formData.get(`products[${productIndex}][listPrice]`)),
                salesPrice: parseFloat(formData.get(`products[${productIndex}][salesPrice]`)),
                description: formData.get(`products[${productIndex}][description]`)
            };
            product.totalValue = product.quantity * product.salesPrice;
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
        const contractDuration = this.calculateContractDuration(data.contractStart, data.contractEnd);
        
        return {
            customer: data.customer,
            totalValue: totalValue,
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
                return product.description.toLowerCase().includes('perpetual') ? 'point-in-time' : 'over-time';
            case 'saas':
            case 'support':
                return 'over-time';
            case 'professional-services':
                return product.description.toLowerCase().includes('ongoing') ? 'over-time' : 'point-in-time';
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
            allocations.push({
                obligation: product.name,
                allocatedAmount: product.totalValue,
                percentage: (product.totalValue / totalValue * 100).toFixed(1),
                method: 'contract-price'
            });
        });
        
        return {
            method: 'contract-price',
            allocations: allocations,
            totalAllocated: totalValue,
            assessment: 'Transaction price allocated based on contract pricing'
        };
    }

    determineRevenueRecognition(data) {
        const recognitionPatterns = [];
        const contractDuration = this.calculateContractDuration(data.contractStart, data.contractEnd);
        
        data.products.forEach(product => {
            const pattern = this.determineDeliveryPattern(product);
            const monthlyAmount = pattern === 'over-time' ? 
                (product.totalValue / contractDuration.months).toFixed(2) : 0;
            
            recognitionPatterns.push({
                obligation: product.name,
                pattern: pattern,
                timing: pattern === 'point-in-time' ? 'Upon delivery/acceptance' : 'Straight-line over contract term',
                monthlyAmount: monthlyAmount,
                totalAmount: product.totalValue
            });
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
        
        return `Revenue recognition: $${overTimeRevenue.toLocaleString()} over time, $${pointInTimeRevenue.toLocaleString()} at point in time`;
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
                        <strong>Total Value:</strong> $${analysis.contractOverview.totalValue.toLocaleString()}
                    </div>
                    <div class="overview-item">
                        <strong>Duration:</strong> ${analysis.contractOverview.duration.years} years (${analysis.contractOverview.duration.months} months)
                    </div>
                    <div class="overview-item">
                        <strong>Products:</strong> ${analysis.contractOverview.productCount}
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
                            <div class="allocation-row">
                                <span class="obligation-name">${allocation.obligation}</span>
                                <span class="allocation-amount">$${allocation.allocatedAmount.toLocaleString()}</span>
                                <span class="allocation-percentage">(${allocation.percentage}%)</span>
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
                                <br>Pattern: ${pattern.pattern}
                                <br>Timing: ${pattern.timing}
                                ${pattern.monthlyAmount > 0 ? `<br>Monthly: $${parseFloat(pattern.monthlyAmount).toLocaleString()}` : ''}
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