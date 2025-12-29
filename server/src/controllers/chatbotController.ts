import { Request, Response } from 'express';
import { prisma } from '../index';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Hàm gọi GPT-4 API
async function callGPT4(messages: ChatMessage[], products: any[]): Promise<string> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    console.log('[Chatbot] callGPT4 - Products count:', products.length);
    console.log('[Chatbot] callGPT4 - Products:', JSON.stringify(products, null, 2));
    console.log('[Chatbot] callGPT4 - Messages count:', messages.length);
    console.log('[Chatbot] callGPT4 - Last user message:', messages[messages.length - 1]?.content);

    if (!OPENAI_API_KEY) {
        console.error('[Chatbot] OPENAI_API_KEY is not configured');
        throw new Error('OPENAI_API_KEY is not configured');
    }

    // Tạo context về sản phẩm
    const productsContext = products.map((product, index) => {
        return `${index + 1}. ${product.title} - ${product.price?.toLocaleString('vi-VN')}đ - ${product.description || 'Không có mô tả'}`;
    }).join('\n');

    console.log('[Chatbot] Products context length:', productsContext.length);
    console.log('[Chatbot] Products context preview:', productsContext.substring(0, 200));

    const systemPrompt = `Bạn là trợ lý bán hàng thông minh của PetZone - cửa hàng chuyên bán sản phẩm cho thú cưng. 
Nhiệm vụ của bạn là:
1. Tư vấn sản phẩm phù hợp dựa trên nhu cầu của khách hàng
2. Đưa ra gợi ý sản phẩm từ danh sách có sẵn
3. Trả lời các câu hỏi về sản phẩm, giá cả, cách sử dụng
4. Hướng dẫn khách hàng mua hàng

Danh sách sản phẩm hiện có:
${productsContext || 'Hiện chưa có sản phẩm phù hợp'}

Hãy trả lời một cách thân thiện, chuyên nghiệp và hữu ích. Nếu có sản phẩm phù hợp, hãy đề xuất cụ thể.`;

    const requestBody = {
        model: 'gpt-4',
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
    };

    console.log('[Chatbot] Sending request to OpenAI API...');
    console.log('[Chatbot] Request body (without API key):', JSON.stringify({
        ...requestBody,
        messages: requestBody.messages.map((m: any, i: number) =>
            i === 0 ? { ...m, content: m.content.substring(0, 100) + '...' } : m
        )
    }, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
    });

    console.log('[Chatbot] OpenAI API response status:', response.status);

    if (!response.ok) {
        const error = await response.json();
        console.error('[Chatbot] OpenAI API error:', JSON.stringify(error, null, 2));
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';

    console.log('[Chatbot] OpenAI API response received');
    console.log('[Chatbot] Bot response length:', botResponse.length);
    console.log('[Chatbot] Bot response:', botResponse);

    return botResponse;
}

// Chat với chatbot
export const chatWithBot = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { message, conversationHistory = [] } = req.body;

        console.log('[Chatbot] chatWithBot - User ID:', userId);
        console.log('[Chatbot] chatWithBot - Received message:', message);
        console.log('[Chatbot] chatWithBot - Conversation history length:', conversationHistory.length);

        if (!message || typeof message !== 'string') {
            console.error('[Chatbot] Invalid message:', message);
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Detect special queries
        const messageLower = message.toLowerCase();
        let orderBy: any = { soldCount: 'desc' }; // Default: bán chạy nhất
        let isSpecialQuery = false;

        if (messageLower.includes('bán chạy') || messageLower.includes('bán chạy nhất') || messageLower.includes('hot')) {
            orderBy = { soldCount: 'desc' };
            isSpecialQuery = true;
            console.log('[Chatbot] Detected: Best selling products');
        } else if (messageLower.includes('giá rẻ') || messageLower.includes('giá thấp') || messageLower.includes('rẻ nhất') || messageLower.includes('rẻ')) {
            orderBy = { price: 'asc' };
            isSpecialQuery = true;
            console.log('[Chatbot] Detected: Cheapest products');
        } else if (messageLower.includes('mới nhất') || messageLower.includes('mới') || messageLower.includes('mới về')) {
            orderBy = { createdAt: 'desc' };
            isSpecialQuery = true;
            console.log('[Chatbot] Detected: Newest products');
        }

        // Extract keywords từ message (loại bỏ các từ không cần thiết)
        const stopWords = ['tôi', 'muốn', 'mua', 'cần', 'cho', 'của', 'bạn', 'có', 'là', 'và', 'với', 'từ', 'đến', 'về', 'để', 'được', 'sẽ', 'đã', 'một', 'các', 'những', 'nào', 'gì', 'không', 'rất', 'nhiều', 'ít', 'hơn', 'bằng', 'sản', 'phẩm', 'bán', 'chạy', 'nhất', 'giá', 'rẻ', 'thấp', 'mới'];
        const words = messageLower
            .replace(/[.,!?;:]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1 && !stopWords.includes(word));

        console.log('[Chatbot] All words:', messageLower.split(/\s+/));
        console.log('[Chatbot] Filtered keywords:', words);
        console.log('[Chatbot] Is special query:', isSpecialQuery);

        // Tạo OR conditions cho tất cả keywords
        const orConditions: any[] = [];
        words.forEach(keyword => {
            orConditions.push(
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                {
                    category: {
                        name: { contains: keyword, mode: 'insensitive' }
                    }
                }
            );
        });

        // Nếu là special query và không có keywords cụ thể, lấy tất cả sản phẩm
        const whereCondition: any = {
            quantity: { gt: 0 }
        };

        // Chỉ thêm OR conditions nếu có keywords và không phải special query đơn thuần
        if (orConditions.length > 0 && !(isSpecialQuery && words.length === 0)) {
            whereCondition.OR = orConditions;
        }

        console.log('[Chatbot] Search where condition:', JSON.stringify(whereCondition, null, 2));
        console.log('[Chatbot] Order by:', JSON.stringify(orderBy, null, 2));

        const products = await prisma.product.findMany({
            where: whereCondition,
            include: {
                images: {
                    take: 1
                },
                category: {
                    select: {
                        name: true
                    }
                },
                store: {
                    select: {
                        storeName: true
                    }
                }
            },
            take: 10, // Lấy 10 sản phẩm phù hợp nhất
            orderBy: orderBy
        });

        console.log('[Chatbot] Found products count:', products.length);
        if (products.length > 0) {
            console.log('[Chatbot] First product sample:', {
                id: products[0].id,
                title: products[0].title,
                price: products[0].price,
                hasImage: !!products[0].images?.[0],
                category: products[0].category?.name
            });
        } else {
            console.warn('[Chatbot] No products found for keywords:', words);
            console.warn('[Chatbot] Original message:', message);
            // Thử tìm tất cả sản phẩm nếu không tìm thấy
            const allProducts = await prisma.product.findMany({
                where: {
                    quantity: { gt: 0 }
                },
                include: {
                    images: { take: 1 },
                    category: { select: { name: true } },
                    store: { select: { storeName: true } }
                },
                take: 10,
                orderBy: { soldCount: 'desc' }
            });
            console.log('[Chatbot] Fallback: Found all products count:', allProducts.length);
        }

        // Format products cho GPT
        const formattedProducts = products.map(product => ({
            id: String(product.id),
            title: product.title,
            price: Number(product.price),
            description: product.description || undefined,
            imageUrl: product.images?.[0]?.url,
            category: product.category?.name,
            storeName: product.store?.storeName
        }));

        console.log('[Chatbot] Formatted products count:', formattedProducts.length);

        // Tạo conversation history
        const chatHistory: ChatMessage[] = conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
        }));

        // Thêm message hiện tại
        chatHistory.push({
            role: 'user',
            content: message
        });

        // Lưu user message vào database
        try {
            await (prisma as any).chatbotMessage.create({
                data: {
                    userId: userId,
                    role: 'user',
                    content: message
                }
            });
            console.log('[Chatbot] Saved user message to database');
        } catch (dbError: any) {
            console.error('[Chatbot] Error saving user message to database:', dbError);
            console.error('[Chatbot] Error message:', dbError.message);
            console.error('[Chatbot] Error code:', dbError.code);
            // Không throw error, tiếp tục xử lý
        }

        // Gọi GPT-4
        console.log('[Chatbot] Calling GPT-4 with', formattedProducts.length, 'products');
        const botResponse = await callGPT4(chatHistory, formattedProducts);
        console.log('[Chatbot] GPT-4 response received, length:', botResponse.length);

        // Lưu bot response vào database
        try {
            await (prisma as any).chatbotMessage.create({
                data: {
                    userId: userId,
                    role: 'assistant',
                    content: botResponse
                }
            });
            console.log('[Chatbot] Saved bot response to database');
        } catch (dbError: any) {
            console.error('[Chatbot] Error saving bot response to database:', dbError);
            console.error('[Chatbot] Error message:', dbError.message);
            console.error('[Chatbot] Error code:', dbError.code);
            // Không throw error, tiếp tục xử lý
        }

        // Trả về response với thông tin sản phẩm
        const responseData = {
            success: true,
            data: {
                message: botResponse,
                products: formattedProducts.length > 0 ? formattedProducts : [],
                conversationHistory: [
                    ...chatHistory,
                    {
                        role: 'assistant',
                        content: botResponse
                    }
                ]
            }
        };

        console.log('[Chatbot] Sending response with', formattedProducts.length, 'products');
        res.json(responseData);
    } catch (error: any) {
        console.error('[Chatbot] Error in chatWithBot:', error);
        console.error('[Chatbot] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get chatbot response'
        });
    }
};

// Lấy lịch sử chat với chatbot
export const getChatbotHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;

        console.log('[Chatbot] getChatbotHistory - User ID:', userId);
        console.log('[Chatbot] getChatbotHistory - Limit:', limit, 'Offset:', offset);

        // Lấy lịch sử từ database
        let messages: any[] = [];
        try {
            messages = await (prisma as any).chatbotMessage.findMany({
                where: {
                    userId: userId
                },
                orderBy: {
                    createdAt: 'asc'
                },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    role: true,
                    content: true,
                    createdAt: true
                }
            });
            console.log('[Chatbot] Found', messages.length, 'messages in history');
        } catch (dbError: any) {
            console.error('[Chatbot] Error fetching chat history from database:', dbError);
            console.error('[Chatbot] Error message:', dbError.message);
            console.error('[Chatbot] Error code:', dbError.code);
            // Trả về empty array nếu có lỗi
            return res.json({
                success: true,
                data: []
            });
        }

        // Format messages
        const formattedMessages = messages.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: msg.createdAt.toISOString()
        }));

        res.json({
            success: true,
            data: formattedMessages
        });
    } catch (error: any) {
        console.error('[Chatbot] Error in getChatbotHistory:', error);
        console.error('[Chatbot] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get chatbot history'
        });
    }
};

// Xóa lịch sử chat với chatbot
export const deleteChatbotHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        console.log('[Chatbot] deleteChatbotHistory - User ID:', userId);

        // Xóa tất cả messages của user
        const result = await (prisma as any).chatbotMessage.deleteMany({
            where: {
                userId: userId
            }
        });

        console.log('[Chatbot] Deleted', result.count, 'messages');

        res.json({
            success: true,
            message: 'Đã xóa lịch sử chat thành công',
            deletedCount: result.count
        });
    } catch (error: any) {
        console.error('[Chatbot] Error in deleteChatbotHistory:', error);
        console.error('[Chatbot] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete chatbot history'
        });
    }
};
