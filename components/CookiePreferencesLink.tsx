'use client';

function CookiePreferencesLink() {
  const handleClick = () => {
    localStorage.removeItem('cookie_consent');
    window.dispatchEvent(new Event('show_cookie_preferences'));
  };

  return (
    <button onClick={handleClick} className="hover:text-slate-800">
      Cookie Preferences
    </button>
  );
}

export default CookiePreferencesLink;
