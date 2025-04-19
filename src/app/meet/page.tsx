"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import pb from "@/lib/pb";

export default function VideoRoom() {
  const searchParams = useSearchParams();
  const roomID = searchParams.get("roomID") || Math.floor(Math.random() * 10000).toString();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to dynamically load Zego SDK
  const loadZegoSDK = () => {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src*="zego-uikit-prebuilt.js"]'
      );
      if (existingScript) {
        if ((window as any).ZegoUIKitPrebuilt) {
          resolve();
        } else {
          existingScript.addEventListener("load", () => resolve());
        }
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Zego SDK"));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const initializeZego = async () => {
      try {
        await loadZegoSDK();
        console.log("Zego SDK loaded");

        const appID = parseInt(process.env.NEXT_PUBLIC_APP_ID || "0");
        const serverSecret = process.env.NEXT_PUBLIC_SERVER_SECRET || "";

        const userID = Math.floor(Math.random() * 10000).toString();
        const userName = "userName" + userID;

        const response = await pb.collection("meetings").getOne(roomID);
        if (!response) throw new Error("Meeting not found.");

        const startTime = new Date(response.startTime);
        const endTime = new Date(response.endTime);
        const now = new Date();

        if (now < startTime || now > endTime) {
          setErrorMessage("The meeting is not active at this time.");
          return;
        }

        const kitToken = (window as any).ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          userID,
          userName
        );

        const zp = (window as any).ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: document.querySelector("#zego-root"),
          sharedLinks: [
            {
              name: "Personal link",
              url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: (window as any).ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          layout: "Auto",
          showLayoutButton: false,
        });

        setLoading(false);
      } catch (error: any) {
        console.error("Zego setup error:", error);
        setErrorMessage(error.message || "An unexpected error occurred.");
        setLoading(false);
      }
    };

    initializeZego();
  }, [roomID]);

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full h-full rounded-none shadow-none">
        <div id="zego-root" className="w-full h-full" />
      </Card>

      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 text-blue-600 text-lg">
          Loading Zego video room...
        </div>
      )}

      {/* {errorMessage && !loading && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-red-600 bg-white p-4 rounded-md shadow-md max-w-sm text-center">
          {errorMessage}
        </div>
      )} */}
    </main>
  );
}
