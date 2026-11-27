import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCsv, exportToPdf } from '../utils/exportUtils';

export const AdminRevenueAndDistrictStats: React.FC = () => {
  const { profiles, paymentRequests, plansList } = useApp();
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Calculate revenue from approved payments and profiles
  const successfulPayments = paymentRequests.filter((p) => p.status === 'approved');
  const pendingPayments = paymentRequests.filter((p) => p.status === 'pending');
  const failedPayments = paymentRequests.filter((p) => p.status === 'rejected');

  const totalRevenue = useMemo(() => {
    return successfulPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 398), 0);
  }, [successfulPayments]);

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return successfulPayments
      .filter((p) => (p.createdAt || '').slice(0, 10) === todayStr)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 398), 0);
  }, [successfulPayments]);

  const monthRevenue = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return successfulPayments
      .filter((p) => (p.createdAt || '').slice(0, 7) === currentMonth)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 398), 0);
  }, [successfulPayments]);

  // District-wise statistics
  const districtStats = useMemo(() => {
    const map: Record<
      string,
      { total: number; premium: number; verified: number; brides: number; grooms: number }
    > = {};

    profiles.forEach((p) => {
      const d = (p.district || 'इतर').trim();
      if (!map[d]) {
        map[d] = { total: 0, premium: 0, verified: 0, brides: 0, grooms: 0 };
      }
      map[d].total += 1;
      if (p.membership && p.membership !== 'free') {
        map[d].premium += 1;
      }
      if (p.isVerified || p.aadhaarVerified || p.verification_status === 'Approved') {
        map[d].verified += 1;
      }
      if (p.gender === 'bride') map[d].brides += 1;
      if (p.gender === 'groom') map[d].grooms += 1;
    });

    return Object.entries(map)
      .map(([district, data]) => ({
        district,
        ...data,
        conversionRate: data.total > 0 ? Math.round((data.premium / data.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [profiles]);

  const totalProfilesCount = profiles.length;
  const premiumProfilesCount = profiles.filter((p) => p.membership && p.membership !== 'free').length;
  const verifiedProfilesCount = profiles.filter(
    (p) => p.isVerified || p.aadhaarVerified || p.verification_status === 'Approved'
  ).length;

  const conversionRate = totalProfilesCount > 0 ? Math.round((premiumProfilesCount / totalProfilesCount) * 100) : 0;

  // EXPORT HANDLERS
  const handleExportUsersCsv = () => {
    const headers = ['ID', 'नाव', 'लिंग', 'वय', 'मोबाईल', 'जिल्हा', 'शिक्षण', 'नोकरी', 'सभासदत्व', 'व्हेरिफाइड'];
    const rows = profiles.map((p) => [
      p.id,
      p.fullName,
      p.gender === 'bride' ? 'वधू' : 'वर',
      p.age,
      p.mobile,
      p.district,
      p.education,
      p.occupation,
      p.membership || 'free',
      p.verification_status === 'Approved' || p.isVerified ? 'होय' : 'नाही'
    ]);
    exportToCsv('vanjari_jodi_users_export', headers, rows);
  };

  const handleExportUsersPdf = () => {
    const headers = ['ID', 'Name', 'Gender', 'Age', 'Mobile', 'District', 'Membership', 'Verified'];
    const rows = profiles.map((p) => [
      p.id,
      p.fullName,
      p.gender,
      p.age,
      p.mobile,
      p.district,
      p.membership || 'free',
      p.isVerified ? 'Yes' : 'No'
    ]);
    exportToPdf('Vanjari Jodi Matrimony - Registered Users Report', headers, rows, 'vanjari_users_report');
  };

  const handleExportRevenueCsv = () => {
    const headers = ['विनंती ID', 'युझर ID', 'नाव', 'मोबाईल', 'प्लॅन', 'रक्कम', 'UTR क्रमांक', 'स्थिती', 'तारीख'];
    const rows = paymentRequests.map((p) => [
      p.id,
      p.userId,
      p.userName,
      p.userMobile,
      p.planId,
      p.amount,
      p.utrNumber,
      p.status,
      new Date(p.createdAt).toLocaleDateString('mr-IN')
    ]);
    exportToCsv('vanjari_jodi_revenue_report', headers, rows);
  };

  const handleExportRevenuePdf = () => {
    const headers = ['Request ID', 'User Name', 'Mobile', 'Plan', 'Amount (INR)', 'UTR', 'Status', 'Date'];
    const rows = paymentRequests.map((p) => [
      p.id,
      p.userName,
      p.userMobile,
      p.planId,
      p.amount,
      p.utrNumber,
      p.status,
      new Date(p.createdAt).toLocaleDateString('en-IN')
    ]);
    exportToPdf('Vanjari Jodi - Financial Revenue & Transactions Report', headers, rows, 'vanjari_revenue_report');
  };

  const handleExportDistrictCsv = () => {
    const headers = ['जिल्हा', 'एकूण प्रोफाईल्स', 'प्रीमियम युझर्स', 'व्हेरिफाइड (Blue Tick)', 'वधू संख्या', 'वर संख्या', 'कन्व्हर्जन दर %'];
    const rows = districtStats.map((d) => [
      d.district,
      d.total,
      d.premium,
      d.verified,
      d.brides,
      d.grooms,
      `${d.conversionRate}%`
    ]);
    exportToCsv('vanjari_jodi_district_statistics', headers, rows);
  };

  const handleExportDistrictPdf = () => {
    const headers = ['District', 'Total Profiles', 'Premium Users', 'Verified Users', 'Brides', 'Grooms', 'Conversion %'];
    const rows = districtStats.map((d) => [
      d.district,
      d.total,
      d.premium,
      d.verified,
      d.brides,
      d.grooms,
      `${d.conversionRate}%`
    ]);
    exportToPdf('Vanjari Jodi - District-wise Statistics Report', headers, rows, 'vanjari_district_stats');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Title */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              महसूल व जिल्हा आकडेवारी डॅशबोर्ड
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                Analytics & Reports
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              दैनिक/मासिक उत्पन्न, जिल्हावार सभासद आकडेवारी आणि Excel / PDF डाऊनलोड
            </p>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={handleExportUsersCsv}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="सर्व युझर्स Excel/CSV मध्ये डाऊनलोड करा"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Users CSV</span>
          </button>
          <button
            onClick={handleExportRevenueCsv}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-black text-xs rounded-xl border border-blue-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="पेमेंट व महसूल अहवाल Excel मध्ये डाऊनलोड करा"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Revenue CSV</span>
          </button>
          <button
            onClick={handleExportDistrictPdf}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs rounded-xl border border-rose-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="जिल्हावार अहवाल PDF मध्ये डाऊनलोड करा"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>District PDF</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>एकूण उत्पन्न (Total Revenue)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>यशस्वी व्यवहार: {successfulPayments.length}</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>चालू महिना उत्पन्न (This Month)</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{monthRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
            <span>आजचे उत्पन्न: ₹{todayRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Premium Members & Conversion Rate */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>प्रीमियम सदस्य (Paid Members)</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{premiumProfilesCount}</div>
          <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
            <span>कन्व्हर्जन दर: {conversionRate}%</span>
          </div>
        </div>

        {/* Verified Blue Tick Profiles */}
        <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>व्हेरिफाइड सदस्य (Blue Tick)</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{verifiedProfilesCount}</div>
          <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
            <span>एकूण नोंदणी: {totalProfilesCount}</span>
          </div>
        </div>
      </div>

      {/* Payment Transactions Summary */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            पेमेंट व्यवहार स्थिती (Transaction Breakdown)
          </h3>
          <button
            onClick={handleExportRevenuePdf}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 underline"
          >
            PDF डाउनलोड करा
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-700 block">यशस्वी (Successful)</span>
            <span className="text-lg font-black text-emerald-900">{successfulPayments.length}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">₹{totalRevenue} जमा</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-700 block">प्रलंबित (Pending)</span>
            <span className="text-lg font-black text-amber-900">{pendingPayments.length}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">तपासणी बाकी</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
            <span className="text-[11px] font-bold text-rose-700 block">नाकारलेले (Failed)</span>
            <span className="text-lg font-black text-rose-900">{failedPayments.length}</span>
            <span className="text-[10px] text-rose-600 block mt-0.5">अवैध UTR</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-700 block">रिफंड्स (Refunds)</span>
            <span className="text-lg font-black text-slate-900">0</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">₹0 परत</span>
          </div>
        </div>
      </div>

      {/* District-wise Statistics Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              जिल्हावार वधू-वर आकडेवारी (District-wise Statistics)
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              कोणत्या जिल्ह्यातून किती वधू, वर व प्रीमियम सभासद आहेत याचे विश्लेषण
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDistrictCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> CSV Export
            </button>
          </div>
        </div>

        {/* Visual Progress Bars for Top Districts */}
        <div className="space-y-2.5 pt-1">
          {districtStats.slice(0, 8).map((d) => {
            const percentageOfTotal = totalProfilesCount > 0 ? Math.round((d.total / totalProfilesCount) * 100) : 0;
            return (
              <div key={d.district} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#800C1E]" />
                    {d.district} ({d.total} प्रोफाईल्स)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    वधू: {d.brides} • वर: {d.grooms} • प्रीमियम: {d.premium} ({percentageOfTotal}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#800C1E] rounded-full"
                    style={{ width: `${Math.max(percentageOfTotal, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto pt-3">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">जिल्हा (District)</th>
                <th className="py-2.5 px-3">एकूण संख्या</th>
                <th className="py-2.5 px-3">वधू (Brides)</th>
                <th className="py-2.5 px-3">वर (Grooms)</th>
                <th className="py-2.5 px-3">प्रीमियम सदस्य</th>
                <th className="py-2.5 px-3">व्हेरिफाइड (Blue Tick)</th>
                <th className="py-2.5 px-3">कन्व्हर्जन दर</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {districtStats.map((d) => (
                <tr key={d.district} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{d.district}</td>
                  <td className="py-2.5 px-3 font-mono font-black">{d.total}</td>
                  <td className="py-2.5 px-3 text-rose-700">{d.brides}</td>
                  <td className="py-2.5 px-3 text-blue-700">{d.grooms}</td>
                  <td className="py-2.5 px-3 text-amber-800 font-bold">{d.premium}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">{d.verified}</td>
                  <td className="py-2.5 px-3 font-mono">{d.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
