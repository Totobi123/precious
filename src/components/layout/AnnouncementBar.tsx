const AnnouncementBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="mx-8 text-xs tracking-[0.25em] uppercase font-light">
            Free Shipping on Orders $75+ &nbsp;&nbsp;•&nbsp;&nbsp; Handmade in Canada &nbsp;&nbsp;•&nbsp;&nbsp; Reusable Up to 5 Wears &nbsp;&nbsp;•&nbsp;&nbsp; Use Code CHIC20 for 20% Off
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
