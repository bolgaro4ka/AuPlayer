export default {
    mounted(el: HTMLElement, binding: any) {
      const callback = binding.value;
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback(); // вызываем функцию при входе в зону видимости
            observer.unobserve(el); // отключаем после первого раза
          }
        });
      });
  
      observer.observe(el);
    }
  }
  