// Quick test to verify ZATCA QR code generation
const QRCode = require("qrcode");

async function testZATCA() {
  try {
    // Simple test data
    const testData = {
      sellerName: "Golden Plate Restaurant",
      vatRegistrationNumber: "123456789012345",
      timestamp: new Date(),
      invoiceTotal: 100.0,
      vatTotal: 13.04,
    };

    // Generate QR code data following ZATCA format
    const qrData = [
      { tag: 1, value: testData.sellerName },
      { tag: 2, value: testData.vatRegistrationNumber },
      { tag: 3, value: testData.timestamp.toISOString() },
      { tag: 4, value: testData.invoiceTotal.toFixed(2) },
      { tag: 5, value: testData.vatTotal.toFixed(2) },
    ];

    // Convert to TLV format
    const tlvData = qrData.map((item) => {
      const tagBuffer = Buffer.from([item.tag]);
      const valueBuffer = Buffer.from(item.value, "utf8");
      const lengthBuffer = Buffer.from([valueBuffer.length]);
      return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
    });

    const base64Data = Buffer.concat(tlvData).toString("base64");

    // Generate QR code
    const qrCode = await QRCode.toDataURL(base64Data, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: "M",
      type: "image/png",
    });

    console.log("✅ ZATCA QR Code generated successfully");
    console.log("QR Code length:", qrCode.length);
    console.log("Base64 data length:", base64Data.length);
    console.log("Sample data:", base64Data.substring(0, 50) + "...");
  } catch (error) {
    console.error("❌ Error generating ZATCA QR code:", error);
  }
}

testZATCA();
