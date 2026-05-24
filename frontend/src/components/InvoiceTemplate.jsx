import React from 'react';
import { Crown, Check } from 'lucide-react';

const InvoiceTemplate = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const {
    invoiceNumber,
    customer,
    items,
    oldGoldExchange,
    totals,
    amountPaid,
    balanceDue,
    paymentStatus,
    createdAt
  } = invoice;

  const dateStr = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      ref={ref} 
      className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border border-slate-200 shadow-sm print-container rounded-2xl"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Swarna Jewellery House</h1>
            <p className="text-[10px] text-slate-500 font-medium">102, Palace Road, Zaveri Nagar, Bengaluru, KA</p>
            <p className="text-[10px] text-slate-500 font-medium">GSTIN: 29ABCDE1234F1Z5 | Phone: +91 80 2234 5678</p>
          </div>
        </div>
        
        <div className="text-right md:text-right flex flex-col items-start md:items-end">
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">TAX INVOICE</span>
          <span className="text-base font-bold text-slate-900">{invoiceNumber}</span>
          <span className="text-[10px] text-slate-500 mt-1">Date: {dateStr}</span>
        </div>
      </div>

      {/* Invoice Ledger Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200 pb-6 mb-8">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">BILLED TO:</span>
          <h3 className="font-bold text-slate-900 text-sm">{customer.name}</h3>
          <p className="text-xs text-slate-600 mt-0.5">Phone: +91 {customer.phone}</p>
          {customer.address && <p className="text-xs text-slate-600 mt-0.5">Address: {customer.address}</p>}
          {customer.gstNumber && <p className="text-xs font-semibold text-slate-800 mt-1">GSTIN: {customer.gstNumber}</p>}
        </div>

        <div className="flex flex-col md:items-end justify-between">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">INVOICE STATUS:</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              paymentStatus === 'paid' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : paymentStatus === 'partially_paid' 
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            } capitalize`}>
              {paymentStatus === 'paid' && <Check className="w-3 h-3" />}
              {paymentStatus === 'partially_paid' ? 'Partially Paid' : paymentStatus}
            </span>
          </div>
          
          <div className="text-left md:text-right mt-4 md:mt-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BRANCH / DESK:</span>
            <span className="text-xs font-semibold text-slate-700">Bengaluru Central Branch</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse print-table mb-8 text-xs">
        <thead>
          <tr className="bg-slate-50 border-b-2 border-slate-200">
            <th className="py-3 px-2 font-bold text-slate-700 w-8">#</th>
            <th className="py-3 px-2 font-bold text-slate-700">Particulars</th>
            <th className="py-3 px-2 font-bold text-slate-700 text-right">Weight (g)</th>
            <th className="py-3 px-2 font-bold text-slate-700">Purity</th>
            <th className="py-3 px-2 font-bold text-slate-700 text-right">Metal Rate (₹/g)</th>
            <th className="py-3 px-2 font-bold text-slate-700 text-right">Stone (₹)</th>
            <th className="py-3 px-2 font-bold text-slate-700 text-right">Making Fee</th>
            <th className="py-3 px-2 font-bold text-slate-700 text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-3 px-2 text-slate-600">{idx + 1}</td>
              <td className="py-3 px-2">
                <span className="font-semibold text-slate-900 block">{item.name}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">{item.metalType}</span>
              </td>
              <td className="py-3 px-2 text-right text-slate-700">{item.weight.toFixed(3)}g</td>
              <td className="py-3 px-2 text-slate-700">{item.purity}</td>
              <td className="py-3 px-2 text-right text-slate-700">₹{item.rateApplied.toLocaleString('en-IN')}</td>
              <td className="py-3 px-2 text-right text-slate-700">₹{item.stonePrice.toLocaleString('en-IN')}</td>
              <td className="py-3 px-2 text-right text-slate-700">
                <span className="block">₹{item.makingChargeTotal.toLocaleString('en-IN')}</span>
                <span className="text-[8px] text-slate-400 capitalize">
                  ({item.makingChargeType === 'per_gram' ? `₹${item.makingCharge}/g` : item.makingChargeType === 'percentage' ? `${item.makingCharge}%` : 'Fixed'})
                </span>
              </td>
              <td className="py-3 px-2 text-right font-semibold text-slate-950">₹{item.itemTotal.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bill Breakdowns and Old Gold Exchanges */}
      <div className="flex flex-col md:flex-row justify-between gap-8 pt-4">
        {/* Old Gold Exchange details */}
        <div className="flex-1">
          {oldGoldExchange && oldGoldExchange.weight > 0 ? (
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2">OLD GOLD EXCHANGE VALUE:</span>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] text-amber-800">
                <span>Old Metal Weight:</span>
                <span className="font-semibold text-right">{oldGoldExchange.weight.toFixed(3)}g</span>
                <span>Purity percentage:</span>
                <span className="font-semibold text-right">{oldGoldExchange.purity}%</span>
                <span>Wastage/Deduction:</span>
                <span className="font-semibold text-right">{oldGoldExchange.deduction}%</span>
                <div className="col-span-2 border-t border-amber-200/50 my-1"></div>
                <span className="font-bold text-amber-900">Exchange Offset Value:</span>
                <span className="font-bold text-amber-900 text-right">− ₹{oldGoldExchange.exchangeValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col justify-center items-center text-slate-400 h-28">
              <span className="text-xs">No Old Gold exchanged in this invoice</span>
            </div>
          )}
          
          {/* Notes / Terms */}
          <div className="mt-6 text-[9px] text-slate-400 leading-relaxed">
            <span className="font-bold block uppercase tracking-wider text-slate-500 mb-1">TERMS & CONDITIONS:</span>
            <p>1. Returns accepted within 7 days against manufacture faults only with full barcode tags.</p>
            <p>2. Making charges, stone valuations and taxes are not subject to standard refunds.</p>
            <p>3. Disputes subject to local jurisdiction of Bengaluru municipal corporation court only.</p>
          </div>
        </div>

        {/* Invoice Summary Totals */}
        <div className="w-full md:w-80">
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Gross Subtotal:</span>
              <span className="font-medium text-slate-900">₹{totals.grossTotal.toLocaleString('en-IN')}</span>
            </div>
            
            {totals.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Cash Discount:</span>
                <span>− ₹{totals.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-slate-100 pt-2 font-medium">
              <span>Taxable Value:</span>
              <span className="text-slate-900">₹{totals.taxableValue.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pl-3">
              <span>CGST (1.5%):</span>
              <span>₹{totals.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pl-3 pb-2">
              <span>SGST (1.5%):</span>
              <span>₹{totals.sgst.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-2">
              <span>GST Total (3%):</span>
              <span className="font-medium text-slate-900">₹{totals.gstTotal.toLocaleString('en-IN')}</span>
            </div>

            {totals.exchangeValue > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Old Gold Exchange:</span>
                <span>− ₹{totals.exchangeValue.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-sm font-bold text-slate-950">
              <span>Final Grand Total:</span>
              <span>₹{totals.finalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-600 font-medium">
              <span>Amount Paid:</span>
              <span className="text-green-700">₹{amountPaid.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 text-xs font-bold">
              <span>Balance Ledger Due:</span>
              <span className={balanceDue > 0 ? 'text-rose-600' : 'text-slate-900'}>
                ₹{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
