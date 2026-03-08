import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const {
    items, isOpen, setIsOpen, removeItem, updateQuantity,
    subtotal, freeShippingThreshold, amountUntilFreeShipping,
  } = useCart();

  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="heading-display text-xl tracking-[0.1em]">Your Bag</SheetTitle>
        </SheetHeader>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-0 py-4 border-b border-border">
            <div className="flex justify-between text-xs tracking-wider mb-2">
              <span className="font-light">
                {amountUntilFreeShipping > 0
                  ? `Spend $${amountUntilFreeShipping.toFixed(0)} more for free shipping`
                  : '🎉 You qualify for free shipping!'
                }
              </span>
            </div>
            <Progress value={shippingProgress} className="h-1.5" />
          </div>
        )}

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={40} strokeWidth={1} className="text-muted-foreground mb-4" />
              <p className="text-sm tracking-wider text-muted-foreground font-light">Your bag is empty</p>
              <Button
                variant="outline"
                className="mt-6 text-xs tracking-[0.15em] uppercase"
                onClick={() => setIsOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                    <p className="text-sm mt-1">${item.product.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="tracking-wider font-light">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full btn-luxury">
                Checkout
              </Button>
            </Link>
            <p className="text-[10px] text-center text-muted-foreground tracking-wider">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
