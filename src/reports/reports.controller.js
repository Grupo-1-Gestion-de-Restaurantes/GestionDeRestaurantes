import Order from '../orders/order.model.js';
import Reservation from '../reservations/reservation.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit-table';
import axios from 'axios';
import mongoose from 'mongoose';

// Colores para la parte de excel
const COLORS = {
    primary: '1B3A5C',
    secondary: '2E86AB',
    accent: 'F4A261',
    success: '2A9D5C',
    lightBg: 'EBF4FA',
    altRow: 'F7FBFE',
    white: 'FFFFFF',
    grayText: '6B7280',
    border: 'CBD5E1',
};

// Configrciones de estilo para Excal
const applyBorders = (cell, color = COLORS.border) => {
    const s = { style: 'thin', color: { argb: 'FF' + color } };
    cell.border = { top: s, left: s, bottom: s, right: s };
};

const styleHeader = (cell, text, bgColor = COLORS.primary) => {
    cell.value = text;
    cell.font = { bold: true, color: { argb: 'FF' + COLORS.white }, size: 10, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgColor } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorders(cell, bgColor);
};

const styleDataCell = (cell, align = 'center', isAlt = false) => {
    cell.font = { size: 9.5, name: 'Calibri', color: { argb: 'FF1F2937' } };
    cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FF' + (isAlt ? COLORS.altRow : COLORS.white) }
    };
    cell.alignment = { horizontal: align, vertical: 'middle' };
    applyBorders(cell);
};

export const getGeneralReport = async (req, res) => {
    try {
        const { format, restaurantId } = req.query;

        const isIndividual = !!restaurantId;
        const filter = isIndividual
            ? { restaurant: new mongoose.Types.ObjectId(restaurantId) }
            : {};

        const topDishes = await Order.aggregate([
            { $match: { status: 'ENTREGADO', ...filter } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ]);

        const peakHours = await Reservation.aggregate([
            { $match: filter },
            { $group: { _id: { $hour: '$reservationDate' }, total: { $sum: 1 } } },
            { $sort: { total: -1 } },
        ]);

        const performance = await Order.aggregate([
            { $match: { status: 'ENTREGADO', ...filter } },
            {
                $group: {
                    _id: '$restaurant',
                    ingresos: { $sum: '$total' },
                    totalPedidos: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'restaurantes', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restInfo',
                },
            },
            { $unwind: '$restInfo' },
            {
                $project: {
                    name: '$restInfo.name',
                    ingresos: 1,
                    totalPedidos: 1,
                    satisfaccion: '$restInfo.rating',
                    capacidad: '$restInfo.capacity',
                },
            },
        ]);

        const occupancy = await Reservation.aggregate([
            { $match: filter },
            { $group: { _id: '$restaurant', totalPeople: { $sum: '$numberOfPeople' } } },
        ]);

        const finalReport = performance.map((p) => {
            const occ = occupancy.find((o) => o._id.toString() === p._id.toString());
            return {
                ...p,
                ocupacionPromedio: occ
                    ? ((occ.totalPeople / p.capacidad) * 100).toFixed(2) + '%'
                    : '0%',
            };
        });

        const reportTitle = isIndividual && finalReport.length > 0
            ? `INFORME DETALLADO: ${finalReport[0].name.toUpperCase()}`
            : 'INFORME ESTRATÉGICO GLOBAL';


        // ---------------------------------------------------- Excel ----------------------------------------------------
        if (format === 'excel') {
            const wb = new ExcelJS.Workbook();
            wb.creator = 'Sistema de Reportes';
            wb.created = new Date();

            // ------------------------------------------------- Hoja 1 -------------------------------------------------
            const sheetPerf = wb.addWorksheet('Desempeño General', {
                views: [{ showGridLines: false }],
                pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
            });

            sheetPerf.columns = [
                { key: 'name', width: 28 },
                { key: 'ingresos', width: 18 },
                { key: 'ocupacionPromedio', width: 16 },
                { key: 'totalPedidos', width: 16 },
                { key: 'satisfaccion', width: 14 },
            ];

            sheetPerf.mergeCells('A1:E1');
            const banner = sheetPerf.getCell('A1');
            banner.value = 'INFORME ESTRATÉGICO DE DESEMPEÑO';
            banner.font = { bold: true, size: 15, color: { argb: 'FF' + COLORS.white }, name: 'Calibri' };
            banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.primary } };
            banner.alignment = { horizontal: 'center', vertical: 'middle' };
            sheetPerf.getRow(1).height = 40;

            sheetPerf.mergeCells('A2:E2');
            const subtitle = sheetPerf.getCell('A2');
            subtitle.value = `Generado el ${new Date().toLocaleDateString('es-GT', { dateStyle: 'long' })}`;
            subtitle.font = { italic: true, size: 9, color: { argb: 'FF' + COLORS.grayText }, name: 'Calibri' };
            subtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.lightBg } };
            subtitle.alignment = { horizontal: 'center', vertical: 'middle' };
            sheetPerf.getRow(2).height = 18;

            sheetPerf.getRow(3).height = 8;

            const headers = ['Restaurante', 'Ingresos', 'Ocupación Avg', 'Pedidos Totales', 'Satisfacción'];
            const headerRow = sheetPerf.getRow(4);
            headerRow.height = 28;
            headers.forEach((h, i) => styleHeader(headerRow.getCell(i + 1), h));

            finalReport.forEach((item, idx) => {
                const row = sheetPerf.getRow(idx + 5);
                row.height = 20;
                const isAlt = idx % 2 !== 0;

                const cells = [
                    { val: item.name, align: 'left' },
                    { val: item.ingresos, align: 'right', fmt: '"Q"#,##0.00' },
                    { val: item.ocupacionPromedio, align: 'center' },
                    { val: item.totalPedidos, align: 'center', fmt: '#,##0' },
                    { val: item.satisfaccion, align: 'center', fmt: '0.0' },
                ];

                cells.forEach(({ val, align, fmt }, i) => {
                    const cell = row.getCell(i + 1);
                    cell.value = val;
                    styleDataCell(cell, align, isAlt);
                    if (fmt) cell.numFmt = fmt;
                });
            });

            const totalRowIdx = finalReport.length + 5;
            const totalRow = sheetPerf.getRow(totalRowIdx);
            totalRow.height = 24;

            const labelCell = totalRow.getCell(1);
            labelCell.value = 'TOTAL GENERAL';
            labelCell.font = { bold: true, size: 10, color: { argb: 'FF' + COLORS.white }, name: 'Calibri' };
            labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.secondary } };
            labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
            applyBorders(labelCell, COLORS.secondary);

            const totalIngCell = totalRow.getCell(2);
            totalIngCell.value = { formula: `=SUM(B5:B${totalRowIdx - 1})` };
            totalIngCell.font = { bold: true, size: 10, color: { argb: 'FF' + COLORS.white }, name: 'Calibri' };
            totalIngCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.secondary } };
            totalIngCell.numFmt = '"Q"#,##0.00';
            totalIngCell.alignment = { horizontal: 'right', vertical: 'middle' };
            applyBorders(totalIngCell, COLORS.secondary);

            [3, 4, 5].forEach((col) => {
                const c = totalRow.getCell(col);
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.secondary } };
                applyBorders(c, COLORS.secondary);
            });

            //Gafica
            const chartConfig = {
                type: 'pie',
                data: {
                    labels: finalReport.map(r => r.name),
                    datasets: [{
                        data: finalReport.map(r => r.ingresos),
                        backgroundColor: ['#1B3A5C', '#2E86AB', '#F4A261', '#2A9D5C']
                    }]
                },
                options: {
                    title: { display: true, text: 'Participación por Restaurante' }
                }
            };

            const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=400&height=300`;
            const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });

            const imageId = wb.addImage({
                buffer: Buffer.from(response.data),
                extension: 'png',
            });

            sheetPerf.addImage(imageId, {
                tl: { col: 6, row: 4 },
                ext: { width: 400, height: 300 }
            });

            // ----------------------------------------------- Hoja 2 ---------------------------------------------------
            const sheetDishes = wb.addWorksheet('Top 10 Platos', {
                views: [{ showGridLines: false }],
            });

            sheetDishes.columns = [
                { key: 'rank', width: 8 },
                { key: 'dish', width: 35 },
                { key: 'totalSold', width: 18 },
            ];

            sheetDishes.mergeCells('A1:C1');
            const bannerD = sheetDishes.getCell('A1');
            bannerD.value = 'TOP 10 PLATOS MÁS VENDIDOS';
            bannerD.font = { bold: true, size: 14, color: { argb: 'FF' + COLORS.white }, name: 'Calibri' };
            bannerD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.accent.replace('#', '') } };
            bannerD.alignment = { horizontal: 'center', vertical: 'middle' };

            bannerD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4A261' } };
            sheetDishes.getRow(1).height = 36;

            sheetDishes.mergeCells('A2:C2');
            sheetDishes.getRow(2).height = 8;

            const dishHeaders = ['#', 'Plato', 'Unidades Vendidas'];
            const dishHeaderRow = sheetDishes.getRow(3);
            dishHeaderRow.height = 26;
            dishHeaders.forEach((h, i) => styleHeader(dishHeaderRow.getCell(i + 1), h, '2E86AB'));

            topDishes.forEach((dish, idx) => {
                const row = sheetDishes.getRow(idx + 4);
                row.height = 20;
                const isAlt = idx % 2 !== 0;

                const rankCell = row.getCell(1);
                rankCell.value = idx + 1;
                styleDataCell(rankCell, 'center', isAlt);
                if (idx === 0) {
                    rankCell.font = { bold: true, size: 11, color: { argb: 'FFFFD700' }, name: 'Calibri' }; // Oro
                }

                const nameCell = row.getCell(2);
                nameCell.value = dish._id;
                styleDataCell(nameCell, 'left', isAlt);

                const qtyCell = row.getCell(3);
                qtyCell.value = dish.totalSold;
                qtyCell.numFmt = '#,##0';
                styleDataCell(qtyCell, 'center', isAlt);
            });

            // Grafico
            const dishesConfig = {
                type: 'bar',
                data: {
                    labels: topDishes.map(d => d._id),
                    datasets: [{
                        label: 'Unidades Vendidas',
                        data: topDishes.map(d => d.totalSold),
                        backgroundColor: '#F4A261'
                    }]
                },
                options: {
                    title: { display: true, text: 'Demanda por Platillo' },
                    scales: {
                        yAxes: [{ ticks: { beginAtZero: true } }]
                    }
                }
            };

            const dishesChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(dishesConfig))}&width=500&height=300`;
            const dishesRes = await axios.get(dishesChartUrl, { responseType: 'arraybuffer' });

            const dishImageId = wb.addImage({
                buffer: Buffer.from(dishesRes.data),
                extension: 'png',
            });

            sheetDishes.addImage(dishImageId, {
                tl: { col: 4, row: 3 },
                ext: { width: 500, height: 300 }
            });

            const sheetPeak = wb.addWorksheet('Análisis de Horas', {
                views: [{ showGridLines: false }]
            });


            // ------------------------------------------ Hoja 3 ---------------------------------------------------

            sheetPeak.columns = [
                { key: 'hour', width: 22 },
                { key: 'total', width: 22 },
            ];

            sheetPeak.mergeCells('A1:B1');
            const bannerP = sheetPeak.getCell('A1');
            bannerP.value = 'REPORTE DE HORAS PICO Rservaciones';
            bannerP.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
            bannerP.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A9D5C' } }; // Verde éxito
            bannerP.alignment = { horizontal: 'center', vertical: 'middle' };
            sheetPeak.getRow(1).height = 35;

            const peakHeaders = ['Franja Horaria', 'Total Reservaciones'];
            const peakHeaderRow = sheetPeak.getRow(3);
            peakHeaders.forEach((h, i) => styleHeader(peakHeaderRow.getCell(i + 1), h, '2A9D5C'));

            peakHours.slice(0, 10).forEach((h, idx) => {
                const row = sheetPeak.getRow(idx + 4);
                const isAlt = idx % 2 !== 0;

                const hourCell = row.getCell(1);
                hourCell.value = `${String(h._id).padStart(2, '0')}:00 hrs`;
                styleDataCell(hourCell, 'center', isAlt);

                const totalCell = row.getCell(2);
                totalCell.value = h.total;
                styleDataCell(totalCell, 'center', isAlt);
            });

            //Grafico
            const peakChartConfig = {
                type: 'line',
                data: {
                    labels: peakHours.slice(0, 10).map(h => `${h._id}:00`),
                    datasets: [{
                        label: 'Reservaciones',
                        data: peakHours.slice(0, 10).map(h => h.total),
                        borderColor: '#2A9D5C',
                        backgroundColor: 'rgba(42, 157, 92, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    title: { display: true, text: 'Tendencia de Reservaciones por Hora' }
                }
            };

            const peakUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(peakChartConfig))}&width=550&height=300`;
            const peakRes = await axios.get(peakUrl, { responseType: 'arraybuffer' });

            const peakImgId = wb.addImage({
                buffer: Buffer.from(peakRes.data),
                extension: 'png',
            });

            // Posicionar a partir de la columna D (col 3)
            sheetPeak.addImage(peakImgId, {
                tl: { col: 3, row: 2 },
                ext: { width: 550, height: 300 }
            });

            // Enviar respuesta
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Completo.xlsx');
            return await wb.xlsx.write(res);
        }

        // ---------------------------------------------------- PDF ----------------------------------------------------
        if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Completo.pdf');
            doc.pipe(res);

            const W = doc.page.width;

            const drawSectionHeader = (label) => {
                doc.moveDown(0.5);
                const y = doc.y;
                doc.rect(40, y, W - 80, 28).fill('#2E86AB');
                doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
                    .text(label, 50, y + 7, { width: W - 100 });
                doc.moveDown(1.5);
            };


            const drawFooter = () => {
                const pageBottom = doc.page.height - 30;
                doc.rect(0, pageBottom - 10, W, 40).fill('#1B3A5C');
                doc.fillColor('#93C5D7').font('Helvetica').fontSize(7.5)
                    .text(
                        `Documento confidencial — Generado automáticamente el ${new Date().toLocaleString('es-GT')}`,
                        40, pageBottom - 2, { align: 'center', width: W - 80 }
                    );
            };

            doc.rect(0, 0, W, 100).fill('#1B3A5C');

            // Línea de acento naranja
            doc.rect(0, 100, W, 5).fill('#F4A261');

            doc.image('assets/logo.png', -20, 15, { width: 150, height: 150, fit: [150, 150] });


            // Título
            doc.fillColor('white')
                .font('Helvetica-Bold')
                .fontSize(20)
                .text('INFORME ESTRATÉGICO DE DESEMPEÑO', 40, 28, { align: 'center', width: W - 80 });

            doc.fillColor('#93C5D7')
                .font('Helvetica')
                .fontSize(10)
                .text(
                    `Fecha: ${new Date().toLocaleDateString('es-GT', { dateStyle: 'long' })}`,
                    40, 68, { align: 'center', width: W - 80 }
                );

            doc.y = 120;

            drawSectionHeader('DESEMPEÑO POR RESTAURANTE');

            await doc.table(
                {
                    headers: [
                        { label: 'Restaurante', property: 'name', width: 150 },
                        { label: 'Ingresos', property: 'ingresos', width: 90 },
                        { label: 'Ocupación', property: 'ocupacion', width: 70 },
                        { label: 'Pedidos', property: 'pedidos', width: 60 },
                        { label: 'Rating', property: 'rating', width: 55 },
                    ],
                    datas: finalReport.map((r) => ({
                        name: r.name,
                        ingresos: `Q${Number(r.ingresos).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
                        ocupacion: r.ocupacionPromedio,
                        pedidos: String(r.totalPedidos),
                        rating: String(r.satisfaccion ?? 'N/A')
                    })),
                },
                {
                    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000'),
                    prepareRow: (row, indexColumn, indexRow, rectRow) => {
                        doc.font('Helvetica').fontSize(9).fillColor('#000000'); // Texto negro para legibilidad
                    },
                    padding: 5,
                    columnSpacing: 7,
                    headerColor: '#FF0000', // Rojo intenso con el #
                    headerOpacity: 1,
                    divider: {
                        header: { disabled: false, width: 1, opacity: 1 },
                        horizontal: { disabled: false, width: 0.5, opacity: 1 },
                    }
                }
            );

            // Grafico
            const performanceConfig = {
                type: 'pie',
                data: {
                    labels: finalReport.map(r => r.name),
                    datasets: [{
                        data: finalReport.map(r => r.ingresos),
                        backgroundColor: ['#1B3A5C', '#2E86AB', '#F4A261', '#2A9D5C', '#E76F51']
                    }]
                },
                options: { title: { display: true, text: 'Distribución de Ingresos' } }
            };

            const perfChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(performanceConfig))}&width=300&height=200`;
            const perfResponse = await axios.get(perfChartUrl, { responseType: 'arraybuffer' });
            doc.image(perfResponse.data, (W / 2) - 150, doc.y + 20, { width: 300 });

            doc.y += 220;

            doc.addPage();

            doc.rect(0, 0, W, 45).fill('#1B3A5C');
            doc.rect(0, 45, W, 4).fill('#F4A261');
            doc.fillColor('white').font('Helvetica-Bold').fontSize(13)
                .text('ANÁLISIS DE DEMANDA', 40, 14, { align: 'center', width: W - 80 });

            doc.y = 65;

            drawSectionHeader('TOP 10 PLATOS MÁS VENDIDOS');

            await doc.table(
                {
                    headers: [
                        { label: '#', property: 'rank', width: 35 },
                        { label: 'Nombre del Plato', property: 'name', width: 310 },
                        { label: 'Unidades Vendidas', property: 'sold', width: 120 },
                    ],
                    datas: topDishes.map((d, i) => ({
                        rank: String(i + 1),
                        name: d._id,
                        sold: String(d.totalSold)
                    })),
                },
                {
                    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000'),
                    prepareRow: (row, indexColumn, indexRow, rectRow) => {
                        doc.font('Helvetica').fontSize(9).fillColor('#000000');
                    },
                    padding: 5,
                    columnSpacing: 7,
                    headerColor: '#F4A261',
                    headerOpacity: 1,
                    divider: {
                        header: { disabled: false, width: 1, opacity: 1 },
                        horizontal: { disabled: false, width: 0.5, opacity: 0.2 },
                    }
                }
            );

            // Grafico
            const dishesConfig = {
                type: 'bar',
                data: {
                    labels: topDishes.map(d => d._id),
                    datasets: [{
                        label: 'Unidades',
                        data: topDishes.map(d => d.totalSold),
                        backgroundColor: '#F4A261'
                    }]
                }
            };

            const dishesChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(dishesConfig))}&width=400&height=200`;
            const dishesResponse = await axios.get(dishesChartUrl, { responseType: 'arraybuffer' });
            doc.image(dishesResponse.data, (W / 2) - 200, doc.y + 15, { width: 400 });

            doc.y += 210;

            drawSectionHeader('HORAS PICO DE RESERVACIONES');

            await doc.table(
                {
                    headers: [
                        { label: 'Hora', property: 'hour', width: 100 },
                        { label: 'Total Reservaciones', property: 'total', width: 200 },
                    ],
                    datas: peakHours.slice(0, 8).map((h) => ({
                        hour: `${String(h._id).padStart(2, '0')}:00 hrs`,
                        total: String(h.total)
                    })),
                },
                {
                    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000'),
                    prepareRow: (row, indexColumn, indexRow, rectRow) => {
                        doc.font('Helvetica').fontSize(9).fillColor('#000000');
                    },
                    padding: 5,
                    columnSpacing: 7,
                    headerColor: '#2A9D5C',
                    headerOpacity: 1,
                    divider: {
                        header: { disabled: false, width: 1, opacity: 1 },
                        horizontal: { disabled: false, width: 0.5, opacity: 0.2 },
                    }
                }
            );

            const peakChartConfig = {
                type: 'line',
                data: {
                    labels: peakHours.slice(0, 8).map(h => `${h._id}:00`),
                    datasets: [{
                        label: 'Reservaciones',
                        data: peakHours.slice(0, 8).map(h => h.total),
                        backgroundColor: 'rgba(42, 157, 92, 0.2)', // Verde éxito con transparencia
                        borderColor: '#2A9D5C',
                        fill: true,
                        tension: 0.4 // Hace la línea curva
                    }]
                }
            };

            const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(peakChartConfig))}&w=400&h=180`;
            const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
            doc.image(response.data, (W / 2) - 200, doc.y + 15, { width: 400 });

            drawFooter();
            doc.end();
            return;
        }

        res.status(200).json({ success: true, data: { finalReport, topDishes, peakHours } });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getRestaurantReportById = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID de la ruta /:id
        const { format } = req.query; // Obtenemos el formato de la query ?format=pdf

        // 1. Validación de formato de ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "El formato del ID de restaurante es inválido."
            });
        }

        // 2. Verificar si el restaurante existe
        const restaurantExists = await Restaurant.findById(id);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: "No se encontró ningún restaurante con ese ID."
            });
        }

        // 3. Inyectar el ID en la query para reutilizar la lógica de getGeneralReport
        // Esto evita duplicar código y usa los filtros que ya programamos
        req.query.restaurantId = id;

        return getGeneralReport(req, res);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al procesar el reporte individual.",
            error: error.message
        });
    }
};
