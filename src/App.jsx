import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Check, 
  X, 
  AlertTriangle, 
  Building2,
  Settings,
  TrendingUp,
  Eye,
  EyeOff,
  HelpCircle,
  Headphones
} from 'lucide-react';

// ============================================
// DATA DEFINITIONS
// ============================================

const FINANCE_OPTIONS = {
  customer: { id: 'customer', name: 'Customer Owns', short: 'Customer' },
  thirdparty: { id: 'thirdparty', name: 'Third-Party Owns', short: '3rd Party' },
  lease: { id: 'lease', name: 'Lease / EaaS', short: 'Lease' }
};

const OPERATE_OPTIONS = {
  customer: { id: 'customer', name: 'Customer Self-Operates', short: 'Customer' },
  supplier: { id: 'supplier', name: 'Supplier Manages', short: 'Supplier' },
  aggregator: { id: 'aggregator', name: 'Aggregator Manages', short: 'Aggregator' }
};

const CONTRACT_TYPES = [
  { 
    id: 'tolling', 
    name: 'Tolling', 
    fullName: 'Tolling Agreement',
    customerRisk: 1, 
    supplierRisk: 5,
    description: 'Fixed €/kW/year. Operator takes all market risk.',
    color: 'blue'
  },
  { 
    id: 'floorShare', 
    name: 'Floor + Share', 
    fullName: 'Floor + Upside Share',
    customerRisk: 2, 
    supplierRisk: 4,
    description: 'Guaranteed minimum plus share of upside.',
    color: 'cyan'
  },
  { 
    id: 'revShareFloor', 
    name: 'RevShare + Floor', 
    fullName: 'Revenue Share with Floor',
    customerRisk: 3, 
    supplierRisk: 3,
    description: 'Percentage split with floor protection.',
    color: 'green'
  },
  { 
    id: 'revShare', 
    name: 'Pure RevShare', 
    fullName: 'Pure Revenue Share',
    customerRisk: 4, 
    supplierRisk: 2,
    description: 'Direct percentage split. Full alignment.',
    color: 'yellow'
  },
  { 
    id: 'fixedFee', 
    name: 'Fixed Fee', 
    fullName: 'Fixed Service Fee',
    customerRisk: 5, 
    supplierRisk: 1,
    description: 'Customer keeps 100%, pays fixed service fee.',
    color: 'orange'
  }
];

// Risk level explanations for tooltips
const CUSTOMER_RISK_EXPLANATIONS = {
  1: "Minimal risk: Fixed income regardless of market conditions",
  2: "Low risk: Protected by floor, limited downside exposure",
  3: "Moderate risk: Floor protection, but returns vary with market",
  4: "Higher risk: No guaranteed minimum, fully exposed to market",
  5: "Full risk: Bears all market and operational risk"
};

const SUPPLIER_RISK_EXPLANATIONS = {
  1: "Minimal risk: Fixed fee income, no market exposure",
  2: "Low risk: Share of upside only, no downside commitment",
  3: "Moderate risk: Shared exposure to market performance",
  4: "Higher risk: Must fund floor if markets underperform",
  5: "Full risk: Guarantees fixed payment regardless of market"
};

// Pre-written "Why This Fits" explanations
const WHY_EXPLANATIONS = {
  customer: {
    customer: {
      text: "They own and control everything. You provide the optimization platform as a service. Fixed fee gives you predictable revenue; they keep full upside and bear full risk.",
      recommended: 'fixedFee'
    },
    supplier: {
      text: "You optimize their asset. Revenue share aligns your interests; the floor protects them from market downturns while your margin comes from outperforming it.",
      recommended: 'revShareFloor'
    },
    aggregator: {
      text: "They own it, aggregator runs it. Revenue share ensures both parties benefit from strong performance. Aggregator's expertise captures market peaks.",
      recommended: 'revShare'
    }
  },
  thirdparty: {
    customer: {
      text: "⚠️ Third-party investors require professional operation to protect their asset and secure financing. This combination is unusual in practice.",
      recommended: null,
      isInvalid: true
    },
    supplier: {
      text: "Investor needs stable, bankable returns. Floor makes the project financeable; you share upside above that threshold. Complex due to Transfer of Energy requirements.",
      recommended: 'floorShare'
    },
    aggregator: {
      text: "Investor-owned, professionally operated. The floor secures debt financing; aggregator optimizes for equity upside. This is the market standard for third-party assets.",
      recommended: 'floorShare'
    }
  },
  lease: {
    customer: {
      text: "Customer avoids capex via lease but operates themselves. Revenue share lets them capture value while covering lease payments. Works for sophisticated customers.",
      recommended: 'revShare'
    },
    supplier: {
      text: "Customer leases to avoid capex; you operate. Revenue share with floor covers the lease payments and gives both parties upside potential.",
      recommended: 'revShareFloor'
    },
    aggregator: {
      text: "Leased asset with external optimization. Floor covers financing cost; aggregator captures market value. This is the standard EaaS model.",
      recommended: 'revShareFloor'
    }
  }
};

// Validity matrix
const VALIDITY_MATRIX = {
  customer: {
    customer: {
      tolling: 'unusual',
      floorShare: 'unusual', 
      revShareFloor: 'unusual',
      revShare: 'natural',
      fixedFee: 'natural'
    },
    supplier: {
      tolling: 'natural',
      floorShare: 'natural',
      revShareFloor: 'natural',
      revShare: 'valid',
      fixedFee: 'complex'
    },
    aggregator: {
      tolling: 'valid',
      floorShare: 'valid',
      revShareFloor: 'valid',
      revShare: 'natural',
      fixedFee: 'complex'
    }
  },
  thirdparty: {
    customer: {
      tolling: 'invalid',
      floorShare: 'invalid',
      revShareFloor: 'invalid',
      revShare: 'invalid',
      fixedFee: 'invalid'
    },
    supplier: {
      tolling: 'complex',
      floorShare: 'natural',
      revShareFloor: 'natural',
      revShare: 'complex',
      fixedFee: 'invalid'
    },
    aggregator: {
      tolling: 'natural',
      floorShare: 'natural',
      revShareFloor: 'natural',
      revShare: 'valid',
      fixedFee: 'invalid'
    }
  },
  lease: {
    customer: {
      tolling: 'unusual',
      floorShare: 'unusual',
      revShareFloor: 'valid',
      revShare: 'natural',
      fixedFee: 'valid'
    },
    supplier: {
      tolling: 'valid',
      floorShare: 'natural',
      revShareFloor: 'natural',
      revShare: 'valid',
      fixedFee: 'complex'
    },
    aggregator: {
      tolling: 'valid',
      floorShare: 'valid',
      revShareFloor: 'natural',
      revShare: 'valid',
      fixedFee: 'complex'
    }
  }
};

// Recommendations based on finance + operate
const RECOMMENDATIONS = {
  customer: {
    customer: 'fixedFee',
    supplier: 'revShareFloor',
    aggregator: 'revShare'
  },
  thirdparty: {
    customer: null, // Invalid combination
    supplier: 'floorShare',
    aggregator: 'floorShare'
  },
  lease: {
    customer: 'revShare',
    supplier: 'revShareFloor',
    aggregator: 'revShareFloor'
  }
};

// Listen for / Pivot triggers
const PIVOT_TRIGGERS = {
  moreProtection: [
    "What if markets underperform?",
    "I want more certainty",
    "What's my guaranteed minimum?",
    "I'm risk-averse"
  ],
  moreUpside: [
    "I want maximum value",
    "I'll take the market risk",
    "I believe prices will stay high",
    "I don't want to leave money on the table"
  ]
};

// Status styling
const STATUS_INFO = {
  natural: { label: 'Natural Fit', icon: Check, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  valid: { label: 'Valid', icon: Check, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  unusual: { label: 'Unusual', icon: AlertTriangle, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  complex: { label: 'Complex', icon: AlertTriangle, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  invalid: { label: 'Invalid', icon: X, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
};

// ============================================
// RISK DOTS WITH TOOLTIP COMPONENT
// ============================================

const RiskDots = ({ level, type, isInvalid }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const explanations = type === 'customer' ? CUSTOMER_RISK_EXPLANATIONS : SUPPLIER_RISK_EXPLANATIONS;
  const dotColor = type === 'customer' ? 'bg-orange-400' : 'bg-blue-400';
  const label = type === 'customer' ? 'C' : 'S';
  
  return (
    <div className="relative">
      <div 
        className="flex items-center justify-center gap-1 text-xs text-gray-500 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>{label}:</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${isInvalid ? 'bg-gray-300' : (i <= level ? dotColor : 'bg-gray-200')}`} 
            />
          ))}
        </div>
        <HelpCircle className="w-3 h-3 text-gray-400" />
      </div>
      
      {showTooltip && !isInvalid && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
          {explanations[level]}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// ============================================
// SPECTRUM VIEW COMPONENT
// ============================================

const SpectrumView = ({ selectedFinance, setSelectedFinance, selectedOperate, setSelectedOperate }) => {
  const recommendation = RECOMMENDATIONS[selectedFinance]?.[selectedOperate];
  const whyData = WHY_EXPLANATIONS[selectedFinance]?.[selectedOperate];
  const isInvalidCombination = whyData?.isInvalid;
  
  const getContractStatus = (contractId) => {
    return VALIDITY_MATRIX[selectedFinance]?.[selectedOperate]?.[contractId] || 'invalid';
  };

  const recommendedIndex = CONTRACT_TYPES.findIndex(c => c.id === recommendation);
  const lessRiskAlt = recommendedIndex > 0 ? CONTRACT_TYPES[recommendedIndex - 1] : null;
  const moreRiskAlt = recommendedIndex < CONTRACT_TYPES.length - 1 ? CONTRACT_TYPES[recommendedIndex + 1] : null;

  // Only show valid alternatives
  const lessRiskValid = lessRiskAlt && getContractStatus(lessRiskAlt.id) !== 'invalid';
  const moreRiskValid = moreRiskAlt && getContractStatus(moreRiskAlt.id) !== 'invalid';

  return (
    <div className="space-y-6">
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Building2 className="w-4 h-4 inline mr-1" />
            Finance (Who Owns?)
          </label>
          <select
            value={selectedFinance}
            onChange={(e) => setSelectedFinance(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(FINANCE_OPTIONS).map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Settings className="w-4 h-4 inline mr-1" />
            Operate (Who Controls?)
          </label>
          <select
            value={selectedOperate}
            onChange={(e) => setSelectedOperate(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(OPERATE_OPTIONS).map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invalid Combination Warning */}
      {isInvalidCombination && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-800">Unusual Combination</div>
              <div className="text-sm text-amber-700 mt-1">{whyData.text}</div>
              <div className="text-sm text-amber-600 mt-2">
                <strong>Consider:</strong> Third-Party + Aggregator Manages or Third-Party + Supplier Manages
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spectrum Header */}
      {!isInvalidCombination && (
        <>
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>← SUPPLIER CONTROL & RISK</span>
            <span>CUSTOMER CONTROL & RISK →</span>
          </div>

          {/* Main Spectrum */}
          <div className="relative">
            {/* Background gradient bar */}
            <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-gradient-to-r from-blue-200 via-green-200 to-orange-200 rounded-full" />
            
            {/* Contract cards */}
            <div className="relative flex justify-between gap-2">
              {CONTRACT_TYPES.map((contract) => {
                const status = getContractStatus(contract.id);
                const statusInfo = STATUS_INFO[status];
                const isRecommended = contract.id === recommendation;
                const isInvalid = status === 'invalid';
                
                // Only show valid contracts
                if (isInvalid) return null;
                
                return (
                  <div
                    key={contract.id}
                    className={`
                      relative flex-1 p-3 rounded-lg border-2 transition-all
                      ${statusInfo.bg} ${statusInfo.border}
                      ${isRecommended ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 z-10 shadow-lg' : ''}
                    `}
                  >
                    {/* Recommended badge */}
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                        RECOMMENDED
                      </div>
                    )}
                    
                    {/* Contract content */}
                    <div className="text-center">
                      <div className="font-semibold text-sm text-gray-800">
                        {contract.name}
                      </div>
                      <div className={`text-xs mt-1 ${statusInfo.text}`}>
                        {statusInfo.label}
                      </div>
                      
                      {/* Risk indicators with tooltips */}
                      <div className="mt-3 space-y-1">
                        <RiskDots level={contract.customerRisk} type="customer" isInvalid={false} />
                        <RiskDots level={contract.supplierRisk} type="supplier" isInvalid={false} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Legend */}
          <div className="flex justify-center gap-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium">C = Customer Risk</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-orange-400" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">S = Supplier Risk</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-400" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <HelpCircle className="w-3 h-3" />
              <span>Hover for details</span>
            </div>
          </div>

          {/* Why This Fits */}
          {whyData && !isInvalidCombination && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="font-semibold text-blue-800 mb-2">Why This Fits</div>
              <div className="text-sm text-blue-700">{whyData.text}</div>
            </div>
          )}

          {/* Listen For Section */}
          {recommendation && (
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Listen For
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* More Protection */}
                <div className={`p-4 rounded-lg border-2 ${lessRiskValid ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
                    ← If customer wants MORE PROTECTION
                  </div>
                  {lessRiskValid ? (
                    <>
                      <div className="font-semibold text-gray-800 text-lg">{lessRiskAlt.fullName}</div>
                      <div className="text-sm text-gray-600 mt-1">{lessRiskAlt.description}</div>
                      <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                        <div className="text-xs font-medium text-blue-600 mb-2">TRIGGER PHRASES:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {PIVOT_TRIGGERS.moreProtection.map((phrase, i) => (
                            <li key={i} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      This is already the most protected structure available.
                    </div>
                  )}
                </div>

                {/* More Upside */}
                <div className={`p-4 rounded-lg border-2 ${moreRiskValid ? 'bg-orange-50 border-orange-200' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-orange-700 font-semibold mb-3">
                    If customer wants MORE UPSIDE →
                  </div>
                  {moreRiskValid ? (
                    <>
                      <div className="font-semibold text-gray-800 text-lg">{moreRiskAlt.fullName}</div>
                      <div className="text-sm text-gray-600 mt-1">{moreRiskAlt.description}</div>
                      <div className="mt-3 p-3 bg-white rounded-lg border border-orange-100">
                        <div className="text-xs font-medium text-orange-600 mb-2">TRIGGER PHRASES:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {PIVOT_TRIGGERS.moreUpside.map((phrase, i) => (
                            <li key={i} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      This is already the maximum upside structure available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================
// MATRIX VIEW COMPONENT
// ============================================

const MatrixView = ({ selectedFinance, selectedOperate, onCellClick }) => {
  const [expandedFinance, setExpandedFinance] = useState('customer');

  const renderCell = (finance, operate, contract) => {
    const status = VALIDITY_MATRIX[finance]?.[operate]?.[contract.id] || 'invalid';
    const statusInfo = STATUS_INFO[status];
    const isRecommended = RECOMMENDATIONS[finance]?.[operate] === contract.id;
    const isSelected = selectedFinance === finance && selectedOperate === operate;
    
    return (
      <td 
        key={contract.id}
        onClick={() => onCellClick(finance, operate, contract.id)}
        className={`
          p-2 text-center text-xs cursor-pointer transition-all border
          ${statusInfo.bg} ${statusInfo.border}
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          hover:brightness-95
        `}
      >
        <div className="flex flex-col items-center gap-1">
          <statusInfo.icon className={`w-4 h-4 ${statusInfo.text}`} />
          <span className={`${statusInfo.text} font-medium`}>
            {statusInfo.label}
          </span>
          {isRecommended && (
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
              REC
            </span>
          )}
        </div>
      </td>
    );
  };

  const renderOperateRows = (finance) => {
    return Object.values(OPERATE_OPTIONS).map(operate => (
      <tr key={operate.id}>
        <td className="p-2 text-sm font-medium text-gray-700 bg-gray-50 border">
          {operate.short}
        </td>
        {CONTRACT_TYPES.map(contract => renderCell(finance, operate.id, contract))}
      </tr>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Click any cell to select that combination. <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs">REC</span> = Recommended for that Finance + Operate combo.
      </div>
      
      {Object.values(FINANCE_OPTIONS).map(finance => (
        <div key={finance.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedFinance(expandedFinance === finance.id ? null : finance.id)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">{finance.name}</span>
            </div>
            {expandedFinance === finance.id ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedFinance === finance.id && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 bg-gray-50 border w-24">
                      OPERATE ↓
                    </th>
                    {CONTRACT_TYPES.map(contract => (
                      <th key={contract.id} className="p-2 text-center text-xs font-semibold text-gray-700 bg-gray-50 border min-w-[90px]">
                        {contract.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renderOperateRows(finance.id)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg text-xs">
        <span className="font-semibold text-gray-600">Legend:</span>
        {Object.entries(STATUS_INFO).map(([key, info]) => (
          <div key={key} className="flex items-center gap-1">
            <info.icon className={`w-3 h-3 ${info.text}`} />
            <span className={info.text}>{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COMBINED VIEW
// ============================================

const CombinedView = () => {
  const [selectedFinance, setSelectedFinance] = useState('customer');
  const [selectedOperate, setSelectedOperate] = useState('supplier');
  const [showMatrix, setShowMatrix] = useState(false);
  
  const handleMatrixCellClick = (finance, operate) => {
    setSelectedFinance(finance);
    setSelectedOperate(operate);
  };

  return (
    <div className="space-y-6">
      {/* Spectrum View */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <SpectrumView 
          selectedFinance={selectedFinance}
          setSelectedFinance={setSelectedFinance}
          selectedOperate={selectedOperate}
          setSelectedOperate={setSelectedOperate}
        />
      </div>

      {/* Matrix Toggle */}
      <button
        onClick={() => setShowMatrix(!showMatrix)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        {showMatrix ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {showMatrix ? 'Hide' : 'Show'} Full Compatibility Matrix
      </button>

      {/* Matrix View */}
      {showMatrix && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Full Compatibility Matrix
          </h2>
          <MatrixView 
            selectedFinance={selectedFinance}
            selectedOperate={selectedOperate}
            onCellClick={handleMatrixCellClick}
          />
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            BESS Contract Type Advisor
          </h1>
          <p className="text-gray-500 mt-1">
            Select ownership and operation model to see recommended contract structures
          </p>
        </div>

        {/* Main Content */}
        <CombinedView />

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Contract recommendations are indicative. Final structure depends on customer specifics and negotiation.
        </div>
      </div>
    </div>
  );
}

export default App;