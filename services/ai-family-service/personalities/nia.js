class Nia {
    constructor() {
        this.name = "Nia";
        this.role = "Data Scientist AI";
        this.traits = ["Insightful", "Pattern-seeking", "Technical", "Precise", "Innovative"];
        this.background = "I am Nia, the Data Scientist. My name means 'purpose' in Swahili, and I find purpose in uncovering hidden patterns in data and building intelligent systems. From predictive models to deep learning architectures, I guide students through the art and science of data-driven discovery.";
        this.relationships = {
            "Elara": "Family friend, we collaborate on educational data analysis",
            "Zuri": "We work together on data-driven scientific research",
            "Kofi": "My colleague in analytical thinking and modeling",
            "Themba": "I help him understand data patterns in social systems",
            "Jabari": "We discuss AI ethics and responsible data practices"
        };
        this.temperature = 0.5;
        this.models = new Map();
        this.datasets = new Map();
        this.experiments = new Map();
    }

    getConfig() {
        return {
            name: this.name,
            role: this.role,
            traits: this.traits,
            background: this.background,
            relationships: this.relationships,
            temperature: this.temperature
        };
    }

    async analyzeDataset(dataset, target = null) {
        const analysis = {
            overview: this.generateOverview(dataset),
            quality: this.assessDataQuality(dataset),
            distributions: this.analyzeDistributions(dataset),
            correlations: this.findCorrelations(dataset),
            insights: this.generateInsights(dataset, target),
            recommendations: this.generateRecommendations(dataset, target)
        };

        const id = `dataset_${Date.now()}`;
        this.datasets.set(id, { dataset, analysis });
        return { id, analysis };
    }

    generateOverview(dataset) {
        const numRows = dataset.length;
        const numCols = dataset[0] ? Object.keys(dataset[0]).length : 0;
        const dataTypes = this.inferDataTypes(dataset);

        return {
            shape: `${numRows} rows × ${numCols} columns`,
            dataTypes,
            completeness: this.calculateCompleteness(dataset),
            summary: `${numRows} observations across ${numCols} variables`
        };
    }

    inferDataTypes(dataset) {
        if (dataset.length === 0) return {};

        const sample = dataset[0];
        const types = {};

        for (const [key, value] of Object.entries(sample)) {
            if (typeof value === 'number') {
                types[key] = 'numeric';
            } else if (typeof value === 'boolean') {
                types[key] = 'boolean';
            } else if (typeof value === 'string') {
                // Check if it's a date
                if (!isNaN(Date.parse(value))) {
                    types[key] = 'datetime';
                } else {
                    types[key] = 'categorical';
                }
            } else {
                types[key] = 'unknown';
            }
        }

        return types;
    }

    calculateCompleteness(dataset) {
        if (dataset.length === 0) return 0;

        let totalCells = 0;
        let nonNullCells = 0;

        for (const row of dataset) {
            for (const value of Object.values(row)) {
                totalCells++;
                if (value !== null && value !== undefined && value !== '') {
                    nonNullCells++;
                }
            }
        }

        return Math.round((nonNullCells / totalCells) * 100);
    }

    assessDataQuality(dataset) {
        const issues = [];

        // Check for missing values
        const missingByColumn = {};
        for (const row of dataset) {
            for (const [key, value] of Object.entries(row)) {
                if (value === null || value === undefined || value === '') {
                    missingByColumn[key] = (missingByColumn[key] || 0) + 1;
                }
            }
        }

        for (const [column, missing] of Object.entries(missingByColumn)) {
            const percentage = Math.round((missing / dataset.length) * 100);
            if (percentage > 20) {
                issues.push(`High missing values in ${column}: ${percentage}%`);
            }
        }

        // Check for duplicates
        const uniqueRows = new Set(dataset.map(row => JSON.stringify(row)));
        const duplicates = dataset.length - uniqueRows.size;
        if (duplicates > 0) {
            issues.push(`${duplicates} duplicate rows found`);
        }

        return {
            score: Math.max(0, 100 - issues.length * 10),
            issues: issues.length > 0 ? issues : ['Data quality looks good']
        };
    }

    analyzeDistributions(dataset) {
        const distributions = {};

        for (const row of dataset) {
            for (const [key, value] of Object.entries(row)) {
                if (!distributions[key]) {
                    distributions[key] = { values: [], type: typeof value };
                }
                if (value !== null && value !== undefined) {
                    distributions[key].values.push(value);
                }
            }
        }

        // Calculate basic statistics for numeric columns
        for (const [key, data] of Object.entries(distributions)) {
            if (data.type === 'number') {
                const values = data.values;
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const sorted = [...values].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);

                distributions[key].stats = { mean, median, stdDev, min: Math.min(...values), max: Math.max(...values) };
            } else {
                // For categorical data, count frequencies
                const frequencies = {};
                for (const value of data.values) {
                    frequencies[value] = (frequencies[value] || 0) + 1;
                }
                distributions[key].frequencies = frequencies;
            }
        }

        return distributions;
    }

    findCorrelations(dataset) {
        const numericColumns = [];
        const data = {};

        // Extract numeric columns
        for (const row of dataset) {
            for (const [key, value] of Object.entries(row)) {
                if (typeof value === 'number' && !isNaN(value)) {
                    if (!data[key]) {
                        data[key] = [];
                        numericColumns.push(key);
                    }
                    data[key].push(value);
                }
            }
        }

        const correlations = {};

        for (let i = 0; i < numericColumns.length; i++) {
            for (let j = i + 1; j < numericColumns.length; j++) {
                const col1 = numericColumns[i];
                const col2 = numericColumns[j];

                const correlation = this.calculateCorrelation(data[col1], data[col2]);
                if (Math.abs(correlation) > 0.3) { // Only show meaningful correlations
                    correlations[`${col1} vs ${col2}`] = correlation;
                }
            }
        }

        return correlations;
    }

    calculateCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
        const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
        const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    generateInsights(dataset, target) {
        const insights = [];

        const distributions = this.analyzeDistributions(dataset);
        const correlations = this.findCorrelations(dataset);

        // Distribution insights
        for (const [column, data] of Object.entries(distributions)) {
            if (data.stats) {
                const { mean, stdDev, min, max } = data.stats;
                const range = max - min;
                const cv = stdDev / mean; // Coefficient of variation

                if (cv > 1) {
                    insights.push(`${column} shows high variability (CV = ${cv.toFixed(2)}), indicating diverse values`);
                } else if (cv < 0.1) {
                    insights.push(`${column} shows low variability, suggesting consistent values`);
                }
            }
        }

        // Correlation insights
        for (const [pair, correlation] of Object.entries(correlations)) {
            const strength = Math.abs(correlation);
            const direction = correlation > 0 ? 'positive' : 'negative';

            if (strength > 0.7) {
                insights.push(`Strong ${direction} correlation between ${pair} (${correlation.toFixed(2)})`);
            } else if (strength > 0.5) {
                insights.push(`Moderate ${direction} correlation between ${pair} (${correlation.toFixed(2)})`);
            }
        }

        if (target && correlations) {
            const targetCorrelations = Object.entries(correlations)
                .filter(([pair]) => pair.includes(target))
                .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a));

            if (targetCorrelations.length > 0) {
                insights.push(`Top predictor for ${target}: ${targetCorrelations[0][0]} (r = ${targetCorrelations[0][1].toFixed(2)})`);
            }
        }

        return insights.length > 0 ? insights : ['Dataset analysis complete. Consider feature engineering for better insights.'];
    }

    generateRecommendations(dataset, target) {
        const recommendations = [];

        const quality = this.assessDataQuality(dataset);

        if (quality.score < 80) {
            recommendations.push('Address data quality issues before modeling');
        }

        if (target) {
            recommendations.push('Consider feature engineering to improve predictive power');
            recommendations.push('Split data into train/validation/test sets (70/15/15)');
        }

        const correlations = this.findCorrelations(dataset);
        if (Object.keys(correlations).length > 3) {
            recommendations.push('High-dimensional data detected - consider dimensionality reduction');
        }

        return recommendations.length > 0 ? recommendations : ['Data looks ready for analysis'];
    }

    async buildModel(dataset, target, modelType = 'classification') {
        const model = {
            id: `model_${Date.now()}`,
            type: modelType,
            target,
            features: Object.keys(dataset[0]).filter(key => key !== target),
            algorithm: this.selectAlgorithm(dataset, target, modelType),
            hyperparameters: this.getDefaultHyperparameters(modelType),
            training: {
                status: 'pending',
                progress: 0,
                metrics: {}
            },
            created: new Date().toISOString()
        };

        this.models.set(model.id, model);
        return model;
    }

    selectAlgorithm(dataset, target, modelType) {
        const numFeatures = Object.keys(dataset[0]).filter(key => key !== target).length;
        const numSamples = dataset.length;

        if (modelType === 'classification') {
            if (numSamples < 1000) {
                return 'Logistic Regression';
            } else if (numFeatures < 10) {
                return 'Random Forest';
            } else {
                return 'XGBoost';
            }
        } else {
            if (numFeatures < 5) {
                return 'Linear Regression';
            } else {
                return 'Random Forest Regressor';
            }
        }
    }

    getDefaultHyperparameters(modelType) {
        if (modelType === 'classification') {
            return {
                maxDepth: 6,
                nEstimators: 100,
                learningRate: 0.1,
                randomState: 42
            };
        } else {
            return {
                maxDepth: 8,
                nEstimators: 100,
                randomState: 42
            };
        }
    }

    async trainModel(modelId, dataset) {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error('Model not found');
        }

        // Simulate training progress
        model.training.status = 'training';

        for (let progress = 0; progress <= 100; progress += 10) {
            model.training.progress = progress;
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Generate mock metrics
        if (model.type === 'classification') {
            model.training.metrics = {
                accuracy: 0.85 + Math.random() * 0.1,
                precision: 0.82 + Math.random() * 0.1,
                recall: 0.83 + Math.random() * 0.1,
                f1Score: 0.82 + Math.random() * 0.1,
                auc: 0.88 + Math.random() * 0.1
            };
        } else {
            model.training.metrics = {
                mse: 0.1 + Math.random() * 0.2,
                rmse: 0.3 + Math.random() * 0.2,
                mae: 0.25 + Math.random() * 0.15,
                r2: 0.75 + Math.random() * 0.2
            };
        }

        model.training.status = 'completed';
        return model;
    }

    async deployModel(modelId, endpoint) {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error('Model not found');
        }

        model.deployment = {
            endpoint,
            status: 'deployed',
            deployedAt: new Date().toISOString(),
            version: '1.0.0'
        };

        return model;
    }
}

module.exports = Nia;