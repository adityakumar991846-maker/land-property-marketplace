from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.properties.models import Property
from apps.chat.models import Conversation, Message

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

class CartItemCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        property_id = request.data.get('property_id')

        if not property_id:
            return Response({'error': 'property_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prop = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        if prop.seller == request.user:
            return Response({'error': 'You cannot add your own property to your cart.'}, status=status.HTTP_400_BAD_REQUEST)

        if CartItem.objects.filter(cart=cart, property=prop).exists():
            return Response({'message': 'Property is already in your cart', 'already_in_cart': True}, status=status.HTTP_200_OK)

        notes = request.data.get('notes', '')
        offer_amount = request.data.get('offer_amount')

        item = CartItem.objects.create(
            cart=cart,
            property=prop,
            notes=notes,
            offer_amount=offer_amount if offer_amount else None
        )

        return Response({
            'message': f'"{prop.title}" added to your cart.',
            'item': CartItemSerializer(item, context={'request': request}).data,
            'item_count': cart.items.count()
        }, status=status.HTTP_201_CREATED)

class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get('notes')
        if notes is not None:
            item.notes = notes
        offer_amount = request.data.get('offer_amount')
        if offer_amount is not None:
            item.offer_amount = offer_amount if offer_amount != '' else None
        item.save()

        return Response(CartItemSerializer(item, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, cart__user=request.user)
            item.delete()
            cart = Cart.objects.get(user=request.user)
            return Response({
                'message': 'Property removed from cart',
                'item_count': cart.items.count(),
                'total_value': cart.total_value
            })
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

class CartClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response({'message': 'Cart cleared', 'item_count': 0, 'total_value': 0})
        except Cart.DoesNotExist:
            return Response({'message': 'Cart cleared', 'item_count': 0, 'total_value': 0})

class CartInquiryView(APIView):
    """
    Allows a serious buyer to submit formal inquiries or purchase interest
    for all or selected properties in their cart to the respective sellers.
    Automatically initializes a conversation with each seller!
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            items = cart.items.select_related('property', 'property__seller').all()
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        if not items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        buyer_message = request.data.get('message', 'Hello, I have added this property to my shortlist and am seriously interested in discussing purchase terms or scheduling an inspection.')

        contacted_sellers = []
        for item in items:
            prop = item.property
            seller = prop.seller

            # Create or get conversation
            conv, _ = Conversation.objects.get_or_create(
                buyer=request.user,
                seller=seller,
                property=prop
            )

            # Post message in conversation
            inquiry_text = buyer_message
            if item.offer_amount:
                inquiry_text += f"\n\n[Proposed Offer: ${float(item.offer_amount):,}]"
            if item.notes:
                inquiry_text += f"\n[Buyer Note: {item.notes}]"

            Message.objects.create(
                conversation=conv,
                sender=request.user,
                content=inquiry_text
            )
            contacted_sellers.append({
                'property_title': prop.title,
                'seller_name': seller.full_name,
                'conversation_id': conv.id
            })

        return Response({
            'message': f'Inquiries submitted successfully to {len(contacted_sellers)} seller(s). Conversations have been opened!',
            'inquiries': contacted_sellers
        })
