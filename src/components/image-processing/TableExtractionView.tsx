import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table as TableIcon, 
  Download, 
  Eye, 
  EyeOff,
  Grid,
  Hash,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ExtractedTable, TableCell } from '@/types/imageProcessing';

interface TableExtractionViewProps {
  tables: ExtractedTable[];
}

export function TableExtractionView({ tables }: TableExtractionViewProps) {
  const [visibleTables, setVisibleTables] = useState<{ [key: string]: boolean }>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const toggleTableVisibility = (tableId: string) => {
    setVisibleTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  const exportTableAsCSV = (table: ExtractedTable) => {
    const csvContent = table.cells.map(row => 
      row.map(cell => {
        if (cell.colSpan === 0 || cell.rowSpan === 0) return ''; // Cellule fusionnée
        return `"${(cell.text || '').replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `table_${table.id}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportTableAsJSON = (table: ExtractedTable) => {
    const jsonData = {
      id: table.id,
      metadata: table.metadata,
      structure: {
        rows: table.rows,
        cols: table.cols
      },
      data: table.cells.map((row, rowIndex) => 
        row.map((cell, colIndex) => ({
          position: { row: rowIndex, col: colIndex },
          span: { rowSpan: cell.rowSpan, colSpan: cell.colSpan },
          content: cell.text || '',
          confidence: cell.confidence
        })).filter(cell => cell.span.rowSpan > 0 && cell.span.colSpan > 0)
      ).flat()
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `table_${table.id}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getBorderStyleIcon = (style: string) => {
    switch (style) {
      case 'explicit': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'mixed': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getQualityBadgeVariant = (quality: number) => {
    if (quality >= 0.8) return "default";
    if (quality >= 0.6) return "secondary";
    return "destructive";
  };

  const renderTablePreview = (table: ExtractedTable) => {
    return (
      <div className="overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <tbody>
            {table.cells.slice(0, 5).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {row.map((cell, colIndex) => {
                  // Ne pas afficher les cellules fusionnées
                  if (cell.colSpan === 0 || cell.rowSpan === 0) {
                    return null;
                  }

                  const isHeader = table.metadata.hasHeaders && rowIndex === 0;
                  
                  return (
                    <td
                      key={colIndex}
                      className={`p-2 border-r ${isHeader ? 'bg-muted font-semibold' : ''}`}
                      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                      colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                    >
                      <div className="min-h-[20px] flex items-center">
                        {cell.text || (
                          <span className="text-muted-foreground italic">vide</span>
                        )}
                      </div>
                      {cell.confidence && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(cell.confidence * 100)}%
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {table.rows && Array.isArray(table.rows) && table.rows.length > 5 && (
              <tr>
                <td 
                  colSpan={table.cols || table.metadata?.columnCount || 1} 
                  className="p-2 text-center text-muted-foreground italic"
                >
                  ... et {(table.rows?.length || 0) - 5} lignes supplémentaires
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  if (tables.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TableIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucune table détectée</h3>
          <p className="text-muted-foreground">
            Traitez des documents contenant des tables pour voir les résultats ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <Card key={table.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TableIcon className="w-5 h-5" />
                Table {table.id.slice(-8)}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge variant={getQualityBadgeVariant(table.metadata.quality)}>
                  Qualité: {Math.round(table.metadata.quality * 100)}%
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleTableVisibility(table.id)}
                >
                  {visibleTables[table.id] ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Afficher
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportTableAsCSV(table)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportTableAsJSON(table)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Métadonnées de la table */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Grid className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Dimensions</p>
                  <p className="font-semibold">{table.rows} × {table.cols}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cellules</p>
                  <p className="font-semibold">
                    {table.cells.flat().filter(cell => 
                      cell.colSpan > 0 && cell.rowSpan > 0
                    ).length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getBorderStyleIcon(table.metadata.borderStyle)}
                <div>
                  <p className="text-xs text-muted-foreground">Style de bordure</p>
                  <p className="font-semibold capitalize">{table.metadata.borderStyle}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${table.metadata.hasHeaders ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-xs text-muted-foreground">En-têtes</p>
                  <p className="font-semibold">
                    {table.metadata.hasHeaders ? 'Détectés' : 'Non détectés'}
                  </p>
                </div>
              </div>
            </div>

            {/* Aperçu de la table */}
            {visibleTables[table.id] && (
              <div className="space-y-4">
                <h4 className="font-medium">Aperçu des données</h4>
                {renderTablePreview(table)}
                
                {/* Informations sur la zone détectée */}
                <div className="bg-muted p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">Zone détectée</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">X:</span> {table.zone.x}px
                    </div>
                    <div>
                      <span className="text-muted-foreground">Y:</span> {table.zone.y}px
                    </div>
                    <div>
                      <span className="text-muted-foreground">Largeur:</span> {table.zone.width}px
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hauteur:</span> {table.zone.height}px
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default TableExtractionView;