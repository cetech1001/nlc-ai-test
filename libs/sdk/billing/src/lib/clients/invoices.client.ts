import {BaseClient} from "@nlc-ai/sdk-core";

export class InvoicesClient extends BaseClient{
  async downloadInvoice(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice PDF');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Download error:', error);
      throw new Error(error.message || "Failed to download invoice PDF");
    }
  }
}
