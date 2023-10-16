
export default function AppLayout({ children }: { children: React.ReactNode; }) {

  return (
      <div className="flex flex-col sm:flex-row">
   
        <div className="w-full overflow-y-auto">
          {children}
        </div>
        
      </div>
    
  );
}
