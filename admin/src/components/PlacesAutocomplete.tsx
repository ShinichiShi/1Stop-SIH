import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

interface PlacesAutocompleteRef {
  clearInput: () => void;
}

const PlacesAutocomplete = forwardRef<
  PlacesAutocompleteRef,
  PlacesAutocompleteProps
>(
  (
    {
      onPlaceSelect,
      placeholder = "Search for a bus stop location...",
      className = "",
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<
      { display_name: string; lat: string; lon: string }[]
    >([]);

    useEffect(() => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 3) {
        setResults([]);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(trimmedQuery)}`,
            {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            setResults([]);
            return;
          }

          const data = (await response.json()) as {
            display_name: string;
            lat: string;
            lon: string;
          }[];
          setResults(data);
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            setResults([]);
          }
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => {
        clearTimeout(timeout);
        controller.abort();
      };
    }, [query]);

    const clearInput = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setQuery("");
      setResults([]);
    };

    useImperativeHandle(ref, () => ({
      clearInput,
    }));

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${className}`}
        />

        {loading && (
          <div className="absolute right-3 top-2.5 text-xs text-gray-500">Searching…</div>
        )}

        {results.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-56 overflow-auto">
            {results.map((result, index) => (
              <li key={`${result.lat}-${result.lon}-${index}`}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                  onClick={() => {
                    const selected = {
                      name: result.display_name,
                      lat: Number(result.lat),
                      lng: Number(result.lon),
                    };
                    setQuery(result.display_name);
                    setResults([]);
                    onPlaceSelect(selected);
                  }}
                >
                  {result.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

PlacesAutocomplete.displayName = "PlacesAutocomplete";

export default PlacesAutocomplete;
