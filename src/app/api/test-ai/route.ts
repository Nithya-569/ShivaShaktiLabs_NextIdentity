import { NextResponse } from "next/server";
import { chatWithAI } from "@/services/ai";

export async function GET() {
    try {
        console.log("TEST ROUTE INITIATED...");
        
        const responseText = await chatWithAI("hello", []);
        
        return NextResponse.json({
            success: true,
            model_response: responseText,
            api_key_configured: !!process.env.OPENAI_API_KEY
        });
        
    } catch (error: any) {
        console.error("TEST ROUTE CATCH:", error);
        
        return NextResponse.json({
            success: false,
            error_message: error?.message,
            error_status: error?.status
        }, { status: 500 });
    }
}
