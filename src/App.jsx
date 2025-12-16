import React, { useState } from 'react';
import { 
  ChevronDown, 
  Check, 
  X, 
  AlertTriangle, 
  Building2,
  Settings,
  Users,
  Eye,
  HelpCircle,
  Info,
  Zap,
  Shield,
  TrendingUp,
  CreditCard
} from 'lucide-react';

// ============================================
// DATA DEFINITIONS - OUR OFFERINGS
// ============================================

const FINANCE_OPTIONS = {
  customer: { 
    id: 'customer', 
    name: 'Customer Owns', 
    short: 'Customer Owns',
    description: 'Customer purchased the battery asset'
  },
  spvLease: { 
    id: 'spvLease', 
    name: 'SPV / Lease', 
    short: 'SPV/Lease',
    description: 'Green4You or third-party SPV finances the asset'
  }
};

const OPERATE_OPTIONS = {
  supplier: { id: 'supplier', name: 'We Manage', short: 'We Manage' },
  aggregator: { id: 'aggregator', name: 'External Aggregator', short: 'Ext. Aggregator' },
  customer: { id: 'customer', name: 'Customer Self-Operates', short: 'Self-Operate' }
};

// OUR PRODUCTS
const OUR_PRODUCTS = {
  exAnte: {
    id: 'exAnte',
    name: 'Ex Ante',
    fullName: 'Ex Ante Fixed Price',
    shortDesc: 'Floor guarantee paid to customer',
    description: 'Fixed price paid TO customer annually. We steer the battery, capture market upside, and protect their capacity tariff.',
    customerRisk: 1,
    supplierRisk: 4,
    color: 'blue',
    validFor: { customer: ['supplier'], spvLease: ['supplier'] },
    contractDetails: [
      'Contract duration: 1-4 years',
      'We steer battery on imbalance/arbitrage markets',
      'We protect customer capacity tariff (Flanders)',
      'Customer receives guaranteed annual payment'
    ],
    customerGets: 'Guaranteed revenue, no operational complexity, capacity tariff protection',
    weGet: 'Market upside potential, portfolio balancing value, customer relationship'
  },
  exPost: {
    id: 'exPost',
    name: 'Ex Post',
    fullName: 'Ex Post Revenue Share',
    shortDesc: 'Revenue split: 80% customer / 20% supplier',
    description: 'Revenue share model with no floor. Customer captures 80% of market revenues, we receive 20% for optimization services.',
    customerRisk: 4,
    supplierRisk: 2,
    color: 'amber',
    validFor: { customer: ['supplier'], spvLease: ['supplier'] },
    contractDetails: [
      'Split: 80% customer / 20% supplier',
      'No guaranteed minimum (full market exposure)',
      'We steer battery, customer captures upside',
      'Capacity tariff protection included'
    ],
    customerGets: 'Higher upside potential, majority share of revenues',
    weGet: 'Performance-based fee, portfolio optimization, lower risk commitment'
  },
  infraFSP: {
    id: 'infraFSP',
    name: 'Infra + FSP',
    fullName: 'Infrastructure + External FSP',
    shortDesc: 'SPV finances, external aggregator operates',
    description: 'SPV (Green4You or third-party) finances the battery. Customer selects external FSP for steering. We aim to remain BRP.',
    customerRisk: 3,
    supplierRisk: 2,
    color: 'purple',
    validFor: { customer: [], spvLease: ['aggregator'] },
    contractDetails: [
      'SPV provides hardware for yearly fixed rent',
      'SPV handles maintenance and insurance',
      'Customer chooses external FSP (aggregator)',
      'ToE framework applies - we aim to remain BRP',
      'All market risks remain with client'
    ],
    customerGets: 'No capex burden, professional optimization, choice of aggregator',
    weGet: 'Lease revenue, potential supply retention via ToE'
  }
};

// Risk explanations
const CUSTOMER_RISK_EXPLANATIONS = {
  1: "Minimal risk: Guaranteed income regardless of market",
  2: "Low risk: Protected returns with professional operation",
  3: "Moderate risk: Must cover lease fee from market revenues",
  4: "Higher risk: No floor protection, full market exposure",
  5: "Full risk: Bears all market and operational risk"
};

const SUPPLIER_RISK_EXPLANATIONS = {
  1: "Minimal risk: Fixed fee, no market commitment",
  2: "Low risk: Performance fee only, limited downside",
  3: "Moderate risk: Shared exposure to market",
  4: "Higher risk: Must fund floor if markets underperform",
  5: "Full risk: Guarantees payment regardless of market"
};

// ============================================
// WARNING STATES
// ============================================

const WARNING_STATES = {
  customerSelfOperates: {
    title: 'Customer Self-Operation Requirements',
    severity: 'warning',
    summary: 'No products available. Customer must meet specific requirements.',
    sections: [
      {
        title: 'PASS-THROUGH CONTRACT REQUIRED',
        items: [
          'Supply contract must be "Contract met valorisatie van de afwijking"',
          'Daily volume nomination required (D-1 by 11:00)',
          'Deviations charged at SI price (imbalance)',
          'Fixed-price clicks are NOT compatible'
        ]
      },
      {
        title: 'MINIMUM REQUIREMENTS',
        items: [
          'Minimum viable scale: 500 kW+ capacity',
          'Customer needs forecasting capability',
          'Market access required (BRP status or platform)',
          'Real-time metering infrastructure (15-min intervals)'
        ]
      },
      {
        title: 'OUR RISK IF NO PASS-THROUGH',
        items: [
          'We are BLIND to customer dispatch decisions',
          'We carry imbalance costs we did not cause',
          'Our hedged position mismatches actual consumption',
          'Volume deviation risk sits entirely with us'
        ],
        severity: 'danger'
      }
    ],
    question: 'Does the customer have pass-through supply contract capability?'
  },
  externalAggregatorCustomerOwns: {
    title: 'External Aggregator Scenario',
    severity: 'info',
    summary: 'Customer works with external FSP. We aim to remain BRP.',
    sections: [
      {
        title: 'OPTION A: WE REMAIN BRP (ToE Applies)',
        items: [
          'Customer works with external FSP (REstore, Next Kraftwerke, etc.)',
          'FSP activates on aFRR, mFRR, FCR markets',
          'Elia corrects our perimeter via Transfer of Energy',
          'FSP compensates us at transfer price'
        ],
        outcome: '✓ We retain: Supply contract, BRP relationship'
      },
      {
        title: 'TOE COMPENSATION',
        items: [
          'Transfer price = DA price + negotiated premium',
          'Target negotiation: DA + premium per MWh',
          'Without premium → we lose margin on transferred energy',
          'With negotiated premium → can be neutral or positive'
        ]
      },
      {
        title: 'OPTION B: CUSTOMER SWITCHES BRP',
        items: [
          'Customer moves BRP relationship to aggregator',
          'We typically lose supply contract as well',
          'Common when aggregator wants full control'
        ],
        severity: 'danger',
        outcome: '✗ Result: Lost customer'
      },
      {
        title: 'RETENTION STRATEGY',
        items: [
          'Propose Ex Ante or Ex Post instead (we operate)',
          'If they want FCR/aFRR: consider aggregator partnership',
          'Negotiate ToE terms proactively with major aggregators'
        ]
      }
    ],
    question: 'Will the aggregator require their own BRP, or accept ToE arrangement?'
  },
  spvSelfOperateNotAvailable: {
    title: 'Self-Operation Not Available',
    severity: 'error',
    summary: 'SPV/Lease financing requires professional operation.',
    sections: [
      {
        title: 'WHY SELF-OPERATION IS NOT AVAILABLE',
        items: [
          'SPV/financer requires professional asset management',
          'Operational risk must be controlled',
          'Lease structure assumes external optimization',
          'Client credit risk management requires visibility'
        ]
      },
      {
        title: 'AVAILABLE ALTERNATIVES',
        items: [
          'We Manage: Ex Ante (floor) or Ex Post (rev share)',
          'External Aggregator: Infra + FSP model',
          'Or: Customer purchases asset outright (Customer Owns)'
        ]
      }
    ]
  }
};

// ============================================
// FULL MARKET VIEW DATA
// ============================================

const MARKET_FINANCE_OPTIONS = {
  customer: { id: 'customer', name: 'Customer Owns', short: 'Customer' },
  thirdPartyLease: { 
    id: 'thirdPartyLease', 
    name: 'Third-Party / Lease', 
    short: '3rd Party/Lease',
    footnote: 'Includes both third-party investors and lease/EaaS structures. Operational lease vs. financial lease distinction exists but does not change operational model.'
  }
};

const MARKET_OPERATE_OPTIONS = {
  customer: { id: 'customer', name: 'Customer Self-Operates', short: 'Customer' },
  supplier: { id: 'supplier', name: 'Supplier Manages', short: 'Supplier' },
  aggregator: { id: 'aggregator', name: 'Aggregator Manages', short: 'Aggregator' }
};

// Market contracts (removed Fixed Service Fee)
const MARKET_CONTRACTS = [
  { 
    id: 'tolling', 
    name: 'Tolling', 
    fullName: 'Tolling Agreement',
    customerRisk: 1, 
    supplierRisk: 5,
    description: 'Operator pays fixed capacity fee. Takes all market risk and dispatch control.',
    color: 'blue'
  },
  { 
    id: 'floorShare', 
    name: 'Floor + Share', 
    fullName: 'Floor + Upside Share',
    customerRisk: 2, 
    supplierRisk: 4,
    description: 'Guaranteed minimum plus percentage share of revenues above floor.',
    color: 'cyan'
  },
  { 
    id: 'revShareFloor', 
    name: 'RevShare + Floor', 
    fullName: 'Revenue Share with Floor',
    customerRisk: 3, 
    supplierRisk: 3,
    description: 'Percentage split with floor protection for asset owner.',
    color: 'green'
  },
  { 
    id: 'revShare', 
    name: 'Pure RevShare', 
    fullName: 'Pure Revenue Share',
    customerRisk: 4, 
    supplierRisk: 2,
    description: 'Direct percentage split of all revenues. Full market alignment.',
    color: 'yellow'
  }
];

// Validity matrix for market view (updated, no fixedFee)
const MARKET_VALIDITY = {
  customer: {
    customer: { tolling: 'unusual', floorShare: 'unusual', revShareFloor: 'unusual', revShare: 'natural' },
    supplier: { tolling: 'natural', floorShare: 'natural', revShareFloor: 'natural', revShare: 'valid' },
    aggregator: { tolling: 'valid', floorShare: 'valid', revShareFloor: 'valid', revShare: 'natural' }
  },
  thirdPartyLease: {
    customer: { tolling: 'invalid', floorShare: 'invalid', revShareFloor: 'invalid', revShare: 'invalid' },
    supplier: { tolling: 'complex', floorShare: 'natural', revShareFloor: 'natural', revShare: 'valid' },
    aggregator: { tolling: 'natural', floorShare: 'natural', revShareFloor: 'natural', revShare: 'valid' }
  }
};

const MARKET_RECOMMENDATIONS = {
  customer: { customer: 'revShare', supplier: 'revShareFloor', aggregator: 'revShare' },
  thirdPartyLease: { customer: null, supplier: 'floorShare', aggregator: 'floorShare' }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getAvailableProducts = (finance, operate) => {
  const products = [];
  Object.values(OUR_PRODUCTS).forEach(product => {
    if (product.validFor[finance]?.includes(operate)) {
      products.push(product);
    }
  });
  return products;
};

const getWarningState = (finance, operate) => {
  if (finance === 'spvLease' && operate === 'customer') {
    return 'spvSelfOperateNotAvailable';
  }
  if (finance === 'customer' && operate === 'customer') {
    return 'customerSelfOperates';
  }
  if (finance === 'customer' && operate === 'aggregator') {
    return 'externalAggregatorCustomerOwns';
  }
  return null;
};

// ============================================
// COMPONENTS
// ============================================

const RiskDot = ({ level, type, showTooltip = true }) => {
  const [hovering, setHovering] = useState(false);
  const explanations = type === 'customer' ? CUSTOMER_RISK_EXPLANATIONS : SUPPLIER_RISK_EXPLANATIONS;
  
  return (
    <div className="relative inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i <= level 
              ? type === 'customer' ? 'bg-blue-500' : 'bg-amber-500'
              : 'bg-gray-200'
          }`}
          onMouseEnter={() => showTooltip && setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        />
      ))}
      {showTooltip && hovering && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          {explanations[level]}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, isRecommended }) => {
  const [expanded, setExpanded] = useState(false);
  
  const colorClasses = {
    blue: 'border-blue-300 bg-blue-50',
    amber: 'border-amber-300 bg-amber-50',
    purple: 'border-purple-300 bg-purple-50'
  };
  
  return (
    <div className={`rounded-xl border-2 ${colorClasses[product.color]} p-5 transition-all ${expanded ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
            {isRecommended && (
              <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">
                RECOMMENDED
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{product.shortDesc}</p>
        </div>
      </div>
      
      <div className="flex gap-6 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Customer Risk</div>
          <RiskDot level={product.customerRisk} type="customer" />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Our Risk</div>
          <RiskDot level={product.supplierRisk} type="supplier" />
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{product.description}</p>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        {expanded ? 'Show less' : 'Show details'}
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Contract Details</h4>
            <ul className="space-y-1">
              {product.contractDetails.map((detail, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-xs font-semibold text-gray-500 mb-1">CUSTOMER GETS</div>
              <p className="text-sm text-gray-700">{product.customerGets}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-xs font-semibold text-gray-500 mb-1">WE GET</div>
              <p className="text-sm text-gray-700">{product.weGet}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WarningStateCard = ({ warningKey }) => {
  const warning = WARNING_STATES[warningKey];
  if (!warning) return null;
  
  const severityColors = {
    warning: 'border-amber-400 bg-amber-50',
    error: 'border-red-400 bg-red-50',
    info: 'border-blue-400 bg-blue-50'
  };
  
  const severityIcons = {
    warning: AlertTriangle,
    error: X,
    info: Info
  };
  
  const iconColors = {
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };
  
  const IconComponent = severityIcons[warning.severity];
  
  return (
    <div className={`rounded-xl border-2 ${severityColors[warning.severity]} p-6`}>
      <div className="flex items-start gap-3 mb-4">
        <IconComponent className={`w-6 h-6 flex-shrink-0 ${iconColors[warning.severity]}`} />
        <div>
          <h3 className="text-lg font-bold text-gray-800">{warning.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{warning.summary}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {warning.sections.map((section, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border ${
              section.severity === 'danger' ? 'bg-red-100 border-red-200' : 'bg-white border-gray-200'
            }`}
          >
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.title}</h4>
            <ul className="space-y-1">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
            {section.outcome && (
              <div className={`mt-3 pt-2 border-t text-sm font-medium ${
                section.outcome.startsWith('✓') ? 'text-green-700' : 'text-red-700'
              }`}>
                {section.outcome}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {warning.question && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-xs font-semibold text-gray-500 mb-1">KEY QUESTION TO ASK</div>
          <p className="text-sm text-gray-800 font-medium">{warning.question}</p>
        </div>
      )}
    </div>
  );
};

const DropdownSelector = ({ label, options, selected, onChange, footnote }) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
        >
          {Object.values(options).map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {footnote && (
        <p className="mt-1 text-xs text-gray-500 italic">{footnote}</p>
      )}
    </div>
  );
};

// ============================================
// GREEN4YOU INFO BOX
// ============================================

const Green4YouInfoBox = () => (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
    <div className="flex items-start gap-2">
      <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-green-800">Green4You / SPV Lease Model</h4>
        <ul className="mt-2 text-sm text-green-700 space-y-1">
          <li>• Client gets hardware for yearly fixed rent</li>
          <li>• Green4You handles maintenance and insurance</li>
          <li>• Client valorizes asset (revenues must exceed lease fee)</li>
          <li>• All market risks sit with client</li>
          <li>• Green4You takes operational risk and client credit risk</li>
        </ul>
      </div>
    </div>
  </div>
);

// ============================================
// OUR OFFERINGS VIEW
// ============================================

const OurOfferingsView = () => {
  const [selectedFinance, setSelectedFinance] = useState('customer');
  const [selectedOperate, setSelectedOperate] = useState('supplier');
  
  const availableProducts = getAvailableProducts(selectedFinance, selectedOperate);
  const warningState = getWarningState(selectedFinance, selectedOperate);
  
  // Determine recommended product
  const getRecommendedProduct = () => {
    if (selectedOperate === 'supplier') {
      return 'exAnte'; // Floor protection = default recommendation
    }
    if (selectedFinance === 'spvLease' && selectedOperate === 'aggregator') {
      return 'infraFSP';
    }
    return null;
  };
  
  const recommendedProduct = getRecommendedProduct();
  
  // Filter operate options based on finance
  const getAvailableOperateOptions = () => {
    if (selectedFinance === 'spvLease') {
      // Self-operate not available for SPV/Lease
      return {
        supplier: OPERATE_OPTIONS.supplier,
        aggregator: OPERATE_OPTIONS.aggregator
      };
    }
    return OPERATE_OPTIONS;
  };
  
  const availableOperateOptions = getAvailableOperateOptions();
  
  // Reset operate if current selection becomes invalid
  React.useEffect(() => {
    if (selectedFinance === 'spvLease' && selectedOperate === 'customer') {
      setSelectedOperate('supplier');
    }
  }, [selectedFinance]);
  
  return (
    <div className="space-y-6">
      {/* Selection Dropdowns */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex gap-4">
          <DropdownSelector
            label="Who finances the battery?"
            options={FINANCE_OPTIONS}
            selected={selectedFinance}
            onChange={setSelectedFinance}
          />
          <DropdownSelector
            label="Who operates the battery?"
            options={availableOperateOptions}
            selected={selectedOperate}
            onChange={setSelectedOperate}
          />
        </div>
      </div>
      
      {/* Green4You Info Box (when SPV/Lease selected) */}
      {selectedFinance === 'spvLease' && <Green4YouInfoBox />}
      
      {/* Results */}
      <div className="space-y-4">
        {/* Available Products */}
        {availableProducts.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Available Products ({availableProducts.length})
            </h3>
            <div className="grid gap-4">
              {availableProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isRecommended={product.id === recommendedProduct}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Warning States (when no products) */}
        {warningState && availableProducts.length === 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              No Products Available
            </h3>
            <WarningStateCard warningKey={warningState} />
          </>
        )}
        
        {/* Info state for external aggregator (products available but important info) */}
        {warningState && availableProducts.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6">
              Important Considerations
            </h3>
            <WarningStateCard warningKey={warningState} />
          </>
        )}
      </div>
      
      {/* Why This Combination */}
      {availableProducts.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Why This Fits
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {selectedFinance === 'customer' && selectedOperate === 'supplier' && (
              <>Customer owns the asset and wants professional optimization without operational complexity. 
              <strong> Ex Ante</strong> provides guaranteed revenue (floor protection), while <strong>Ex Post</strong> 
              offers higher upside potential for customers with greater risk appetite. Both models include 
              capacity tariff protection in Flanders.</>
            )}
            {selectedFinance === 'spvLease' && selectedOperate === 'supplier' && (
              <>SPV/Green4You finances the asset, client pays fixed lease. Client must valorize the battery to 
              cover lease costs. <strong>Ex Ante</strong> provides certainty to cover the lease fee, while 
              <strong> Ex Post</strong> offers higher potential but requires the client to accept market risk 
              vs. their lease obligation.</>
            )}
            {selectedFinance === 'spvLease' && selectedOperate === 'aggregator' && (
              <>SPV finances the installation, eliminating customer capex burden. External FSP provides 
              professional market optimization. Client retains choice of aggregator. Key priority: ensure ToE 
              arrangement to retain supply relationship and BRP status.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// FULL MARKET VIEW
// ============================================

const FullMarketView = () => {
  const [selectedFinance, setSelectedFinance] = useState('customer');
  const [selectedOperate, setSelectedOperate] = useState('supplier');
  
  const statusInfo = {
    natural: { label: 'Natural Fit', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', icon: Check },
    valid: { label: 'Valid', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: Check },
    complex: { label: 'Complex', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: AlertTriangle },
    unusual: { label: 'Unusual', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-500', icon: HelpCircle },
    invalid: { label: 'Not Valid', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-500', icon: X }
  };
  
  const recommendedContract = MARKET_RECOMMENDATIONS[selectedFinance]?.[selectedOperate];
  const isInvalidCombo = selectedFinance === 'thirdPartyLease' && selectedOperate === 'customer';
  
  const getValidContracts = () => {
    const matrix = MARKET_VALIDITY[selectedFinance]?.[selectedOperate];
    if (!matrix) return [];
    
    return MARKET_CONTRACTS.filter(contract => {
      const status = matrix[contract.id];
      return status !== 'invalid';
    }).map(contract => ({
      ...contract,
      status: matrix[contract.id],
      isRecommended: contract.id === recommendedContract
    }));
  };
  
  const validContracts = getValidContracts();
  
  // Get footnote for selected finance option
  const selectedFinanceOption = MARKET_FINANCE_OPTIONS[selectedFinance];
  
  return (
    <div className="space-y-6">
      {/* Selection */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex gap-4">
          <DropdownSelector
            label="Who finances the battery?"
            options={MARKET_FINANCE_OPTIONS}
            selected={selectedFinance}
            onChange={setSelectedFinance}
            footnote={selectedFinanceOption?.footnote}
          />
          <DropdownSelector
            label="Who operates the battery?"
            options={MARKET_OPERATE_OPTIONS}
            selected={selectedOperate}
            onChange={setSelectedOperate}
          />
        </div>
      </div>
      
      {/* Invalid Combination Warning */}
      {isInvalidCombo && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <X className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Invalid Combination</h3>
              <p className="text-sm text-red-600 mt-1">
                Third-party investors and lease structures require professional operation to protect the asset 
                and secure financing. Customer self-operation is not viable for externally financed assets.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Contract Spectrum */}
      {!isInvalidCombo && (
        <>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Contract Structures (Market View)
          </h3>
          
          {/* Risk Spectrum Header */}
          <div className="flex justify-between items-center px-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              More Protection (Customer)
            </div>
            <div className="flex items-center gap-1">
              More Upside (Customer)
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          {/* Contract Cards */}
          <div className="grid gap-3">
            {validContracts.map(contract => {
              const status = statusInfo[contract.status];
              const StatusIcon = status.icon;
              return (
                <div 
                  key={contract.id}
                  className={`rounded-xl border-2 ${status.bg} ${status.border} p-4 transition-all ${
                    contract.isRecommended ? 'ring-2 ring-green-500 ring-offset-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800">{contract.fullName}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} border ${status.border} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        {contract.isRecommended && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white font-semibold">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
                    </div>
                    <div className="flex gap-4 ml-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">C</div>
                        <RiskDot level={contract.customerRisk} type="customer" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">S</div>
                        <RiskDot level={contract.supplierRisk} type="supplier" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg text-xs">
            <span className="font-semibold text-gray-600">Legend:</span>
            {Object.entries(statusInfo).filter(([k]) => k !== 'invalid').map(([key, info]) => {
              const IconComp = info.icon;
              return (
                <div key={key} className="flex items-center gap-1">
                  <IconComp className={`w-3 h-3 ${info.text}`} />
                  <span className={info.text}>{info.label}</span>
                </div>
              );
            })}
            <span className="text-gray-400 ml-2">C = Customer Risk | S = Supplier Risk</span>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

function App() {
  const [viewMode, setViewMode] = useState('ours');
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            BTM BESS Contract Advisor
          </h1>
          <p className="text-gray-500 mt-1">
            Select ownership and operation model to see recommended contract structures
          </p>
          
          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('ours')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'ours'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              Our Offerings
            </button>
            <button
              onClick={() => setViewMode('market')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'market'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Full Market View
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {viewMode === 'ours' ? <OurOfferingsView /> : <FullMarketView />}
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Contract recommendations are indicative. Final structure depends on customer specifics and negotiation.
        </div>
      </div>
    </div>
  );
}

export default App;
