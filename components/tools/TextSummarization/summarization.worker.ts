import { pipeline, Pipeline } from '@xenova/transformers';

console.log('Summarization worker initialized');

class SummarizationPipeline {
    static task = 'summarization';
    static model: string | null = null;
    static instance: Pipeline | null = null;

    static async getInstance(
        modelName: string,
        progress_callback: ((data: { status: string; progress?: number; file?: string }) => void) | null = null
    ): Promise<Pipeline> {
        if (this.model !== modelName || !this.instance) {
            this.model = modelName;
            console.log('Loading model:', modelName);
            this.instance = await pipeline(this.task, this.model, { progress_callback });
            console.log('Model loaded successfully');
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event: MessageEvent) => {
    console.log('Worker received message:', event.data);

    const { type, text, model } = event.data;

    try {
        if (type === 'summarize') {
            console.log('Starting summarization with text length:', text?.length);

            const summarizer = await SummarizationPipeline.getInstance(
                model,
                (x) => {
                    console.log('Progress callback:', x);
                    if (x.status === 'progress' && x.progress !== undefined) {
                        self.postMessage({ status: 'progress', progress: x.progress });
                    } else if (x.status === 'done') {
                        self.postMessage({ status: 'done', file: x.file });
                    } else if (x.status === 'initiate') {
                        self.postMessage({ status: 'initiate' });
                    }
                }
            );

            console.log('Sending ready status');
            self.postMessage({ status: 'ready' });

            console.log('Starting summarization...');
            const output = await summarizer(text);
            const summaryText = Array.isArray(output) ? output[0]?.summary_text : output.summary_text;
            console.log('Summarization complete, output length:', summaryText?.length);

            self.postMessage({ status: 'complete', output: summaryText });
        } else if (type === 'ready') {
            console.log('Checking if model is ready:', model);
            const summarizer = await SummarizationPipeline.getInstance(model);
            if (summarizer) {
                console.log('Model loaded, sending ready status');
                self.postMessage({ status: 'ready' });
            }
        }
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to summarize text'
        });
    }
});

export { };
