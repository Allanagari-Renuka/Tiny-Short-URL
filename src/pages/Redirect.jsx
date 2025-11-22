// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { Loader2 } from "lucide-react";

// const Redirect = () => {
//   const { shortCode } = useParams();
//   const navigate = useNavigate();
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const redirect = async () => {
//       if (!shortCode) {
//         navigate("/");
//         return;
//       }

//       try {
//         // Call the redirect edge function
//         const { data, error } = await supabase.functions.invoke('redirect', {
//           body: { code: shortCode }
//         });

//         if (error) throw error;

//         if (data && data.url) {
//           // Redirect to the original URL
//           window.location.href = data.url;
//         } else {
//           setError("URL not found");
//           setTimeout(() => navigate("/"), 2000);
//         }
//       } catch (err: any) {
//         console.error("Redirect error:", err);
//         setError("Failed to redirect");
//         setTimeout(() => navigate("/"), 2000);
//       }
//     };

//     redirect();
//   }, [shortCode, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
//       <div className="text-center space-y-4">
//         {error ? (
//           <>
//             <p className="text-xl text-destructive">{error}</p>
//             <p className="text-sm text-muted-foreground">Redirecting to home...</p>
//           </>
//         ) : (
//           <>
//             <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
//             <p className="text-xl text-foreground">Redirecting...</p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Redirect;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Redirect = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const redirect = async () => {
      if (!shortCode) {
        navigate("/");
        return;
      }

      try {
        // Call the redirect edge function with code as query param
        const { data, error } = await supabase.functions.invoke(`redirect?code=${encodeURIComponent(shortCode)}`);

        if (error) throw error;

        if (data && data.url) {
          // Redirect to the original URL
          window.location.href = data.url;
        } else {
          setError("URL not found");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("Redirect error:", err);
        setError("Failed to redirect");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    redirect();
  }, [shortCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-xl text-red-500">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to home...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-xl text-foreground">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Redirect;
