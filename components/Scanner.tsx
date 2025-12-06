import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Keyboard, AlertCircle, X } from 'lucide-react';

interface ScannerProps {
  onScan: (data: string) => void;
  label?: string;
  simulateData?: string; // Data to inject for simulation
}

const Scanner: React.FC<ScannerProps> = ({ onScan, label = "Pindai Kode QR", simulateData }) => {
  const [isManual, setIsManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<any>(null);
  const regionId = "html5-qrcode-reader";

  useEffect(() => {
    if (isManual) {
      cleanupScanner();
      return;
    }

    // Check if library is loaded
    const Html5Qrcode = (window as any).Html5Qrcode;
    if (!Html5Qrcode) {
      setScanError("Library Scanner tidak dimuat. Harap periksa koneksi internet.");
      return;
    }

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        // Configuration
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };
        
        // Start scanning with rear camera preference
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config,
          (decodedText: string) => {
            // Success callback
            handleScanSuccess(decodedText, html5QrCode);
          },
          (errorMessage: string) => {
            // Ignore individual frame errors, they are common
          }
        );
        setHasPermission(true);
        setScanError(null);
      } catch (err) {
        console.error("Error starting scanner", err);
        setHasPermission(false);
        setScanError("Gagal mengakses kamera. Pastikan izin diberikan.");
      }
    };

    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
       startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupScanner();
    };
  }, [isManual]);

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch((err: any) => {
           // Ignore stop errors if already stopped
           console.warn("Scanner stop warning", err);
        });
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }
  };

  const handleScanSuccess = (decodedText: string, scannerInstance: any) => {
    // Validate format
    if (decodedText.startsWith('UNIT:') || decodedText.startsWith('TRANS:')) {
        scannerInstance.stop().then(() => {
            scannerInstance.clear();
            onScan(decodedText);
        }).catch((err: any) => console.error("Failed to stop scanner", err));
    } else {
        // Optional: Provide visual feedback for invalid format
        console.warn("Format QR tidak valid:", decodedText);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
        // Simple validation
        if (manualCode.includes(':')) {
            onScan(manualCode);
        } else {
            setScanError("Format kode tidak valid. Harus mengandung ':' (contoh: UNIT:123)");
        }
    }
  };

  const handleSimulate = () => {
      if (simulateData) onScan(simulateData);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-700 relative">
      
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-white font-medium flex items-center gap-2">
            <Camera size={18} className="text-emerald-400" />
            {isManual ? "Input Manual" : label}
        </h3>
        {simulateData && !isManual && (
            <button 
                onClick={handleSimulate}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-emerald-400 px-2 py-1 rounded transition-colors"
            >
                Debug: Simulasi
            </button>
        )}
      </div>

      <div className="relative bg-black min-h-[320px] flex flex-col items-center justify-center">
        {isManual ? (
           <div className="p-6 w-full h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in">
              <div className="bg-slate-800 p-4 rounded-full">
                 <Keyboard size={48} className="text-emerald-500" />
              </div>
              <form onSubmit={handleManualSubmit} className="w-full space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Kode Unit / Transaksi</label>
                    <input 
                        type="text" 
                        value={manualCode}
                        onChange={(e) => {
                            setManualCode(e.target.value);
                            setScanError(null);
                        }}
                        placeholder="Contoh: UNIT:123 atau TRANS:TRX-99"
                        className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-600"
                        autoFocus
                    />
                  </div>
                  {scanError && (
                      <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded">
                          <AlertCircle size={14} />
                          <span>{scanError}</span>
                      </div>
                  )}
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
                      Proses Kode
                  </button>
              </form>
           </div>
        ) : (
           <>
              {/* HTML5-QRCode Target Div */}
              <div id={regionId} className="w-full h-full"></div>
              
              {/* Overlay for Scanning Guideline */}
              {!scanError && hasPermission !== false && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 -mt-0.5 -ml-0.5"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 -mt-0.5 -mr-0.5"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 -mb-0.5 -ml-0.5"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 -mb-0.5 -mr-0.5"></div>
                        <div className="w-full h-0.5 bg-emerald-400 absolute top-1/2 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-[pulse_2s_ease-in-out_infinite]"></div>
                    </div>
                </div>
              )}

              {/* Status Message */}
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                  <p className="text-white/80 text-sm bg-black/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                      {hasPermission === false ? "Kamera tidak tersedia" : "Arahkan kamera ke QR Code"}
                  </p>
              </div>

              {/* Error State */}
              {scanError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 p-6 text-center z-10">
                      <div className="space-y-4">
                          <AlertCircle className="mx-auto text-red-500" size={48} />
                          <p className="text-white font-medium">{scanError}</p>
                          <button 
                            onClick={() => setIsManual(true)}
                            className="text-emerald-400 hover:text-emerald-300 underline text-sm"
                          >
                            Gunakan Input Manual
                          </button>
                      </div>
                  </div>
              )}
           </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-center">
         <button 
            onClick={() => setIsManual(!isManual)}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-slate-700"
         >
            {isManual ? (
                <>
                    <Camera size={18} />
                    <span>Gunakan Kamera</span>
                </>
            ) : (
                <>
                    <Keyboard size={18} />
                    <span>Input Manual / Offline</span>
                </>
            )}
         </button>
      </div>
    </div>
  );
};

export default Scanner;